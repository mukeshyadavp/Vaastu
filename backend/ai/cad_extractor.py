import ezdxf
from shapely.geometry import Polygon
from shapely.ops import unary_union


LAYER_NAMES = {
    "plot": ["PLOT", "PLOT_BOUNDARY", "SITE_BOUNDARY", "BOUNDARY"],
    "building": ["BUILDING", "BUILDING_FOOTPRINT", "FOOTPRINT"],
    "road": ["ROAD", "ROAD_WIDTH", "APPROACH_ROAD"],
}


def normalize_layer(name: str) -> str:
    return name.strip().upper().replace(" ", "_")


def layer_matches(layer_name: str, accepted_names: list[str]) -> bool:
    return normalize_layer(layer_name) in accepted_names


def points_from_lwpolyline(entity):
    points = []

    try:
        for point in entity.get_points():
            points.append((float(point[0]), float(point[1])))
    except Exception:
        return []

    return points


def points_from_polyline(entity):
    points = []

    try:
        for vertex in entity.vertices:
            location = vertex.dxf.location
            points.append((float(location.x), float(location.y)))
    except Exception:
        return []

    return points


def polygon_from_entity(entity):
    entity_type = entity.dxftype()

    if entity_type == "LWPOLYLINE":
        points = points_from_lwpolyline(entity)

    elif entity_type == "POLYLINE":
        points = points_from_polyline(entity)

    else:
        return None

    if len(points) < 3:
        return None

    if points[0] != points[-1]:
        points.append(points[0])

    polygon = Polygon(points)

    if polygon.is_valid and polygon.area > 0:
        return polygon

    return None


def collect_polygons(modelspace, layer_names: list[str]):
    polygons = []
    skipped = []

    for entity in modelspace:
        try:
            layer = normalize_layer(entity.dxf.layer)

            if not layer_matches(layer, layer_names):
                continue

            polygon = polygon_from_entity(entity)

            if polygon is not None:
                polygons.append(polygon)
            else:
                skipped.append({
                    "type": entity.dxftype(),
                    "layer": layer,
                    "reason": "Could not convert entity to polygon"
                })

        except Exception as error:
            skipped.append({
                "type": entity.dxftype() if hasattr(entity, "dxftype") else "UNKNOWN",
                "layer": getattr(entity.dxf, "layer", "UNKNOWN") if hasattr(entity, "dxf") else "UNKNOWN",
                "reason": str(error)
            })

    return polygons, skipped


def extract_dxf_measurements(file_path: str) -> dict:
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

    if not plot_polygons:
        raise ValueError(
            "No valid plot boundary found. Use a closed polyline on layer PLOT_BOUNDARY."
        )

    if not building_polygons:
        raise ValueError(
            "No valid building footprint found. Use a closed polyline on layer BUILDING_FOOTPRINT."
        )

    plot_polygon = unary_union(plot_polygons)
    building_polygon = unary_union(building_polygons)

    plot_area = round(plot_polygon.area, 2)
    builtup_area_ground = round(building_polygon.area, 2)

    plot_minx, plot_miny, plot_maxx, plot_maxy = plot_polygon.bounds
    bldg_minx, bldg_miny, bldg_maxx, bldg_maxy = building_polygon.bounds

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
            "skippedPlotEntities": skipped_plot,
            "skippedBuildingEntities": skipped_building,
        }
    }