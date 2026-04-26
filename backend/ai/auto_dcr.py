from typing import Any, Dict, List


RULE_REFERENCES = {
    "setback": "Table 17, G.O.Ms.No.119",
    "parking": "Table 11, G.O.Ms.No.119",
    "room": "Table 5, G.O.Ms.No.119",
    "far": "Chapter VII, G.O.Ms.No.119",
    "ground_coverage": "Chapter VII, G.O.Ms.No.119",
    "rain_water": "Chapter XI-1, Rule 152",
    "fire": "Chapter VI, G.O.Ms.No.119",
    "road": "Road Width Rules, G.O.Ms.No.119",
}


def to_float(data: Dict[str, Any], key: str, default: float = 0.0) -> float:
    value = data.get(key, default)

    try:
        if value is None or value == "":
            return default

        return float(value)
    except (TypeError, ValueError):
        return default


def to_int(data: Dict[str, Any], key: str, default: int = 0) -> int:
    value = data.get(key, default)

    try:
        if value is None or value == "":
            return default

        return int(float(value))
    except (TypeError, ValueError):
        return default


def to_bool(data: Dict[str, Any], key: str, default: bool = False) -> bool:
    value = data.get(key, default)

    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        return value.strip().lower() in ["true", "yes", "1", "y", "on"]

    return bool(value)


def get_setback_rules(plot_area_sq_m: float, height_m: float) -> Dict[str, float]:
    """
    Deterministic AP-style setback rule selection.

    These values are aligned with your current VAASTU sample reports:
    - 300 sq.m plot: front 3.0m, rear 2.0m, side 1.5m
    - 500 sq.m plot: front 4.0m, rear 2.5m, side 2.0m

    You can later move this table to database.
    """

    if plot_area_sq_m <= 300:
        return {
            "front": 3.0,
            "rear": 2.0,
            "side": 1.5,
        }

    if plot_area_sq_m <= 500:
        return {
            "front": 4.0,
            "rear": 2.5,
            "side": 2.0,
        }

    if height_m <= 15:
        return {
            "front": 5.0,
            "rear": 3.0,
            "side": 3.0,
        }

    return {
        "front": 6.0,
        "rear": 4.0,
        "side": 4.0,
    }


def get_max_far(building_type: str, plot_area_sq_m: float) -> float:
    building_type = building_type.lower()

    if "commercial" in building_type:
        return 2.0

    if plot_area_sq_m <= 300:
        return 1.75

    if plot_area_sq_m <= 500:
        return 1.75

    return 2.0


def get_max_ground_coverage(plot_area_sq_m: float) -> float:
    if plot_area_sq_m <= 300:
        return 70.0

    if plot_area_sq_m <= 500:
        return 70.0

    return 60.0


def get_required_parking_percent(
    building_type: str,
    builtup_area_sq_m: float
) -> float:
    building_type = building_type.lower()

    if "commercial" in building_type:
        return 40.0

    if builtup_area_sq_m <= 500:
        return 40.0

    return 30.0


def add_check(
    checks: List[Dict[str, Any]],
    rule: str,
    submitted: float,
    required: float,
    unit: str,
    reference: str,
    passed: bool,
    pass_message: str,
    fail_message: str,
    suggestion: str = "",
) -> None:
    checks.append({
        "rule": rule,
        "status": "PASSED" if passed else "FAILED",
        "submitted": submitted,
        "required": required,
        "unit": unit,
        "reference": reference,
        "message": pass_message if passed else fail_message,
        "suggestion": "" if passed else suggestion,
    })


def run_auto_dcr_scrutiny(
    file_path: str,
    submitted_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Actual Auto-DCR Rule Engine.

    This function does not randomly approve/reject.
    It validates real submitted measurements against deterministic rules.

    file_path is retained for future CAD/DXF extraction support.
    """

    building_type = submitted_data.get("buildingType", "Residential")
    classification = submitted_data.get("classification", "Non-High-Rise")

    plot_area = to_float(submitted_data, "plotArea", 0)
    builtup_area = to_float(submitted_data, "builtupArea", 0)
    floors = to_int(submitted_data, "floors", 1)
    height = to_float(submitted_data, "height", 0)

    front_setback = to_float(submitted_data, "frontSetback", 0)
    rear_setback = to_float(submitted_data, "rearSetback", 0)
    side1_setback = to_float(submitted_data, "side1Setback", 0)
    side2_setback = to_float(submitted_data, "side2Setback", 0)

    road_width = to_float(submitted_data, "roadWidth", 0)
    parking_percent = to_float(submitted_data, "parkingPercent", 0)

    room_area = to_float(submitted_data, "roomArea", 0)
    room_width = to_float(submitted_data, "roomWidth", 0)
    kitchen_area = to_float(submitted_data, "kitchenArea", 0)

    rain_water_harvesting = to_bool(
        submitted_data,
        "rainWaterHarvesting",
        False
    )

    fire_noc = to_bool(
        submitted_data,
        "fireNoc",
        False
    )

    if plot_area <= 0:
        raise ValueError("Plot area is required for Auto-DCR scrutiny")

    if builtup_area <= 0:
        raise ValueError("Built-up area is required for Auto-DCR scrutiny")

    if floors <= 0:
        floors = 1

    setback_rules = get_setback_rules(plot_area, height)

    far = round(builtup_area / plot_area, 2)
    ground_floor_area = builtup_area / floors
    ground_coverage = round((ground_floor_area / plot_area) * 100, 2)

    max_far = get_max_far(building_type, plot_area)
    max_ground_coverage = get_max_ground_coverage(plot_area)
    required_parking = get_required_parking_percent(
        building_type,
        builtup_area
    )

    min_road_width = 9.0
    min_room_area = 9.5
    min_room_width = 2.4
    min_kitchen_area = 4.5

    rain_water_required = plot_area >= 200
    fire_noc_required = height > 15

    checks: List[Dict[str, Any]] = []

    # Front setback
    add_check(
        checks=checks,
        rule="Front Setback",
        submitted=front_setback,
        required=setback_rules["front"],
        unit="meters",
        reference=RULE_REFERENCES["setback"],
        passed=front_setback >= setback_rules["front"],
        pass_message=(
            f"Front setback {front_setback}m meets "
            f"requirement of {setback_rules['front']}m"
        ),
        fail_message=(
            f"Front setback {front_setback}m is less than "
            f"required {setback_rules['front']}m"
        ),
        suggestion=(
            f"Increase front setback by "
            f"{round(setback_rules['front'] - front_setback, 2)}m"
        ),
    )

    # Rear setback
    add_check(
        checks=checks,
        rule="Rear Setback",
        submitted=rear_setback,
        required=setback_rules["rear"],
        unit="meters",
        reference=RULE_REFERENCES["setback"],
        passed=rear_setback >= setback_rules["rear"],
        pass_message=(
            f"Rear setback {rear_setback}m meets "
            f"requirement of {setback_rules['rear']}m"
        ),
        fail_message=(
            f"Rear setback {rear_setback}m is less than "
            f"required {setback_rules['rear']}m"
        ),
        suggestion=(
            f"Increase rear setback by "
            f"{round(setback_rules['rear'] - rear_setback, 2)}m"
        ),
    )

    # Side 1 setback
    add_check(
        checks=checks,
        rule="Side 1 Setback",
        submitted=side1_setback,
        required=setback_rules["side"],
        unit="meters",
        reference=RULE_REFERENCES["setback"],
        passed=side1_setback >= setback_rules["side"],
        pass_message=(
            f"Side 1 setback {side1_setback}m meets "
            f"requirement of {setback_rules['side']}m"
        ),
        fail_message=(
            f"Side 1 setback {side1_setback}m is less than "
            f"required {setback_rules['side']}m"
        ),
        suggestion=(
            f"Increase side 1 setback by "
            f"{round(setback_rules['side'] - side1_setback, 2)}m"
        ),
    )

    # Side 2 setback
    add_check(
        checks=checks,
        rule="Side 2 Setback",
        submitted=side2_setback,
        required=setback_rules["side"],
        unit="meters",
        reference=RULE_REFERENCES["setback"],
        passed=side2_setback >= setback_rules["side"],
        pass_message=(
            f"Side 2 setback {side2_setback}m meets "
            f"requirement of {setback_rules['side']}m"
        ),
        fail_message=(
            f"Side 2 setback {side2_setback}m is less than "
            f"required {setback_rules['side']}m"
        ),
        suggestion=(
            f"Increase side 2 setback by "
            f"{round(setback_rules['side'] - side2_setback, 2)}m"
        ),
    )

    # Road width
    add_check(
        checks=checks,
        rule="Road Width",
        submitted=road_width,
        required=min_road_width,
        unit="meters",
        reference=RULE_REFERENCES["road"],
        passed=road_width >= min_road_width,
        pass_message=(
            f"Road width {road_width}m meets minimum "
            f"requirement of {min_road_width}m"
        ),
        fail_message=(
            f"Road width {road_width}m is less than "
            f"required {min_road_width}m"
        ),
        suggestion=(
            f"Provide minimum approach road width of {min_road_width}m"
        ),
    )

    # Parking
    add_check(
        checks=checks,
        rule="Parking Requirement",
        submitted=parking_percent,
        required=required_parking,
        unit="% of built-up",
        reference=RULE_REFERENCES["parking"],
        passed=parking_percent >= required_parking,
        pass_message=(
            f"Parking {parking_percent}% meets "
            f"requirement of {required_parking}%"
        ),
        fail_message=(
            f"Parking {parking_percent}% is less than "
            f"required {required_parking}%"
        ),
        suggestion=(
            f"Increase parking provision to at least "
            f"{required_parking}% of built-up area"
        ),
    )

    # Room area
    add_check(
        checks=checks,
        rule="Habitable Room Area",
        submitted=room_area,
        required=min_room_area,
        unit="sq.m",
        reference=RULE_REFERENCES["room"],
        passed=room_area >= min_room_area,
        pass_message=(
            f"Room area {room_area} sq.m meets minimum "
            f"{min_room_area} sq.m"
        ),
        fail_message=(
            f"Room area {room_area} sq.m is less than "
            f"minimum {min_room_area} sq.m"
        ),
        suggestion=(
            f"Increase habitable room area to at least "
            f"{min_room_area} sq.m"
        ),
    )

    # Room width
    add_check(
        checks=checks,
        rule="Habitable Room Width",
        submitted=room_width,
        required=min_room_width,
        unit="meters",
        reference=RULE_REFERENCES["room"],
        passed=room_width >= min_room_width,
        pass_message=(
            f"Room width {room_width}m meets minimum "
            f"{min_room_width}m"
        ),
        fail_message=(
            f"Room width {room_width}m is less than "
            f"minimum {min_room_width}m"
        ),
        suggestion=(
            f"Increase room width to at least {min_room_width}m"
        ),
    )

    # Kitchen area
    add_check(
        checks=checks,
        rule="Kitchen Area",
        submitted=kitchen_area,
        required=min_kitchen_area,
        unit="sq.m",
        reference=RULE_REFERENCES["room"],
        passed=kitchen_area >= min_kitchen_area,
        pass_message=(
            f"Kitchen area {kitchen_area} sq.m meets minimum "
            f"{min_kitchen_area} sq.m"
        ),
        fail_message=(
            f"Kitchen area {kitchen_area} sq.m is less than "
            f"minimum {min_kitchen_area} sq.m"
        ),
        suggestion=(
            f"Increase kitchen area to at least {min_kitchen_area} sq.m"
        ),
    )

    # FAR / FSI
    add_check(
        checks=checks,
        rule="Floor Area Ratio",
        submitted=far,
        required=max_far,
        unit="ratio",
        reference=RULE_REFERENCES["far"],
        passed=far <= max_far,
        pass_message=(
            f"FAR {far} is within permissible limit of {max_far}"
        ),
        fail_message=(
            f"FAR {far} exceeds maximum permissible {max_far}"
        ),
        suggestion=(
            f"Reduce built-up area to maximum "
            f"{round(max_far * plot_area, 2)} sq.m"
        ),
    )

    # Ground coverage
    add_check(
        checks=checks,
        rule="Ground Coverage",
        submitted=ground_coverage,
        required=max_ground_coverage,
        unit="%",
        reference=RULE_REFERENCES["ground_coverage"],
        passed=ground_coverage <= max_ground_coverage,
        pass_message=(
            f"Ground coverage {ground_coverage}% is within "
            f"limit of {max_ground_coverage}%"
        ),
        fail_message=(
            f"Ground coverage {ground_coverage}% exceeds "
            f"limit of {max_ground_coverage}%"
        ),
        suggestion=(
            f"Reduce ground coverage to maximum "
            f"{max_ground_coverage}%"
        ),
    )

    # Rain water harvesting
    add_check(
        checks=checks,
        rule="Rain Water Harvesting",
        submitted=1 if rain_water_harvesting else 0,
        required=1 if rain_water_required else 0,
        unit="provision",
        reference=RULE_REFERENCES["rain_water"],
        passed=True if not rain_water_required else rain_water_harvesting,
        pass_message=(
            "Rain water harvesting provision included"
            if rain_water_required
            else "Rain water harvesting not mandatory for this plot size"
        ),
        fail_message=(
            "Rain water harvesting is mandatory for plots >= 200 sq.m"
        ),
        suggestion=(
            "Add rain water harvesting structure as per Chapter XI-1 guidelines"
        ),
    )

    # Fire NOC
    add_check(
        checks=checks,
        rule="Fire Department NOC",
        submitted=1 if fire_noc else 0,
        required=1 if fire_noc_required else 0,
        unit="clearance",
        reference=RULE_REFERENCES["fire"],
        passed=fire_noc if fire_noc_required else True,
        pass_message=(
            "Fire NOC requirement satisfied"
            if fire_noc_required
            else "Fire NOC not required for this building"
        ),
        fail_message="Fire Department NOC is required for this building",
        suggestion="Upload valid Fire Department NOC",
    )

    violations = []

    for check in checks:
        if check["status"] == "FAILED":
            violations.append({
                "rule": check["rule"],
                "required": f'{check["required"]} {check["unit"]}',
                "found": f'{check["submitted"]} {check["unit"]}',
                "message": check["message"],
                "suggestion": check["suggestion"],
                "reference": check["reference"],
            })

    passed_count = len([check for check in checks if check["status"] == "PASSED"])
    violation_count = len(violations)

    status = "PASSED" if violation_count == 0 else "FAILED"

    return {
        "engine": "VAASTU Auto-DCR Rule Engine",
        "status": status,
        "isCompliant": status == "PASSED",

        "checks": checks,

        "summary": {
            "passed": passed_count,
            "warnings": 0,
            "violations": violation_count,
            "totalChecks": len(checks),
        },

        "measurements": {
            "plot_area_sq_m": plot_area,
            "builtup_area_sq_m": builtup_area,
            "floors": floors,
            "height_m": height,
            "front_setback_m": front_setback,
            "rear_setback_m": rear_setback,
            "left_setback_m": side1_setback,
            "right_setback_m": side2_setback,
            "road_width_m": road_width,
            "parking_percent": parking_percent,
            "room_area_sq_m": room_area,
            "room_width_m": room_width,
            "kitchen_area_sq_m": kitchen_area,
            "far": far,
            "ground_coverage_percent": ground_coverage,
            "rain_water_harvesting": 1 if rain_water_harvesting else 0,
            "fire_noc": 1 if fire_noc else 0,
        },

        "rules": {
            "min_front_setback_m": setback_rules["front"],
            "min_rear_setback_m": setback_rules["rear"],
            "min_side_setback_m": setback_rules["side"],
            "min_road_width_m": min_road_width,
            "required_parking_percent": required_parking,
            "min_room_area_sq_m": min_room_area,
            "min_room_width_m": min_room_width,
            "min_kitchen_area_sq_m": min_kitchen_area,
            "max_fsi": max_far,
            "max_ground_coverage_percent": max_ground_coverage,
            "rain_water_required": 1 if rain_water_required else 0,
            "fire_noc_required": 1 if fire_noc_required else 0,
        },

        "violations": violations,

        "recommendation": (
            "Plan is compliant. Provisional technical approval can be generated."
            if status == "PASSED"
            else "Plan rejected. Applicant must correct listed violations and re-upload."
        ),

        "applicationDetails": {
            "buildingType": building_type,
            "classification": classification,
        },
    }