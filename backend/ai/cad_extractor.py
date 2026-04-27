import ezdxf
from typing import Any, Dict, List, Optional, Tuple


Point = Tuple[float, float]


LAYER_NAMES = {
    "plot": ["PLOT", "PLOT_BOUNDARY", "SITE_BOUNDARY", "BOUNDARY"],
    "building": ["BUILDING", "BUILDING_FOOTPRINT", "FOOTPRINT"],
    "road": ["ROAD", "ROAD_WIDTH", "APPROACH_ROAD"],
}


def normalize_layer(name: str) -> str:
    return name.strip().upper().replace(" ", "_")


def layer_matches(layer_name: str, accepted_names: List[str]) -> bool:
    return normalize_layer(layer_name) in accepted_names


def close_points(points: List[Point]) -> List[Point]:
    if not points:
        return points

    if points[0] != points[-1]:
        points.append(points[0])

    return points


def polygon_area(points: List[Point]) -> float:
    """
    Calculates polygon area using the Shoelace formula.
    This avoids Shapely/GEOS dependency.
    """
    closed_points = close_points(points[:])

    if len(closed_points) < 4:
        return 0.0

    area = 0.0

    for index in range(len(closed_points) - 1):
        x1, y1 = closed_points[index]
        x2, y2 = closed_points[index + 1]
        area += (x1 * y2) - (x2 * y1)

    return abs(area) / 2.0


def polygon_bounds(points: List[Point]) -> Tuple[float, float, float, float]:
    xs = [point[0] for point in points]
    ys = [point[1] for point in points]

    return min(xs), min(ys), max(xs), max(ys)


def points_from_lwpolyline(entity) -> List[Point]:
    points: List[Point] = []

    try:
        for point in entity.get_points():
            points.append((float(point[0]), float(point[1])))
    except Exception:
        return []

    return points


def points_from_polyline(entity) -> List[Point]:
    points: List[Point] = []

    try:
        for vertex in entity.vertices:
            location = vertex.dxf.location
            points.append((float(location.x), float(location.y)))
    except Exception:
        return []

    return points


def points_from_entity(entity) -> List[Point]:
    entity_type = entity.dxftype()

    if entity_type == "LWPOLYLINE":
        return points_from_lwpolyline(entity)

    if entity_type == "POLYLINE":
        return points_from_polyline(entity)

    return []


def collect_polygons(modelspace, layer_names: List[str]):
    polygons = []
    skipped = []

    for entity in modelspace:
        try:
            layer = normalize_layer(entity.dxf.layer)

            if not layer_matches(layer, layer_names):
                continue

            points = points_from_entity(entity)

            if len(points) < 3:
                skipped.append({
                    "type": entity.dxftype(),
                    "layer": layer,
                    "reason": "Entity has fewer than 3 points",
                })
                continue

            area = polygon_area(points)

            if area <= 0:
                skipped.append({
                    "type": entity.dxftype(),
                    "layer": layer,
                    "reason": "Polygon area is zero",
                })
                continue

            polygons.append({
                "layer": layer,
                "type": entity.dxftype(),
                "points": close_points(points),
                "area": area,
                "bounds": polygon_bounds(points),
            })

        except Exception as error:
            skipped.append({
                "type": entity.dxftype() if hasattr(entity, "dxftype") else "UNKNOWN",
                "layer": getattr(entity.dxf, "layer", "UNKNOWN") if hasattr(entity, "dxf") else "UNKNOWN",
                "reason": str(error),
            })

    return polygons, skipped


def select_largest_polygon(polygons: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not polygons:
        return None

    return max(polygons, key=lambda item: item["area"])


def extract_dxf_measurements(file_path: str) -> Dict[str, Any]:
    try:
        doc = ezdxf.readfile(file_path)
    except Exception as error:
        raise ValueError(f"Invalid DXF file: {str(error)}")

    modelspace = doc.modelspace()

    plot_polygons, skipped_plot = collect_polygons(
        modelspace,
        LAYER_NAMES["plot"]
    )

    building_polygons, skipped_building = collect_polygons(
        modelspace,
        LAYER_NAMES["building"]
    )

    plot_polygon = select_largest_polygon(plot_polygons)
    building_polygon = select_largest_polygon(building_polygons)

    if plot_polygon is None:
        raise ValueError(
            "No valid plot boundary found. Use a closed polyline on layer PLOT_BOUNDARY."
        )

    if building_polygon is None:
        raise ValueError(
            "No valid building footprint found. Use a closed polyline on layer BUILDING_FOOTPRINT."
        )

    plot_area = round(plot_polygon["area"], 2)
    builtup_area_ground = round(building_polygon["area"], 2)

    plot_minx, plot_miny, plot_maxx, plot_maxy = plot_polygon["bounds"]
    bldg_minx, bldg_miny, bldg_maxx, bldg_maxy = building_polygon["bounds"]

    front_setback = round(bldg_miny - plot_miny, 2)
    rear_setback = round(plot_maxy - bldg_maxy, 2)
    side1_setback = round(bldg_minx - plot_minx, 2)
    side2_setback = round(plot_maxx - bldg_maxx, 2)

    return {
        "plotArea": plot_area,
        "builtupAreaGround": builtup_area_ground,
        "frontSetback": front_setback,
        "rearSetback": rear_setback,
        "side1Setback": side1_setback,
        "side2Setback": side2_setback,
        "debug": {
            "plotPolygon": {
                "layer": plot_polygon["layer"],
                "area": round(plot_polygon["area"], 2),
                "bounds": plot_polygon["bounds"],
            },
            "buildingPolygon": {
                "layer": building_polygon["layer"],
                "area": round(building_polygon["area"], 2),
                "bounds": building_polygon["bounds"],
            },
            "skippedPlotEntities": skipped_plot,
            "skippedBuildingEntities": skipped_building,
        },
    }


def extract_dxf_summary_for_ai(file_path: str) -> Dict[str, Any]:
    measurements = extract_dxf_measurements(file_path)

    return {
        "source": "DXF",
        "deterministicMeasurements": {
            "plotArea": measurements.get("plotArea"),
            "builtupAreaGround": measurements.get("builtupAreaGround"),
            "frontSetback": measurements.get("frontSetback"),
            "rearSetback": measurements.get("rearSetback"),
            "side1Setback": measurements.get("side1Setback"),
            "side2Setback": measurements.get("side2Setback"),
        },
        "debug": measurements.get("debug", {}),
        "layerRequirements": {
            "plotBoundaryLayer": "PLOT_BOUNDARY",
            "buildingFootprintLayer": "BUILDING_FOOTPRINT",
            "optionalLayers": [
                "ROAD",
                "PARKING",
                "ROOM",
                "KITCHEN",
                "RAIN_WATER_HARVESTING",
                "FIRE_NOC",
            ],
        },
    }