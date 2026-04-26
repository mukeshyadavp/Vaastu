import os
import random
from typing import Dict, List


DTCP_RULES = {
    "min_front_setback_m": 3.0,
    "min_rear_setback_m": 2.0,
    "min_side_setback_m": 1.5,
    "min_road_width_m": 9.0,
    "max_fsi": 1.5,
}


def mock_extract_plan_measurements(file_path: str) -> Dict:
    """
    Temporary AI mock extractor.

    Later you can replace this with:
    - DXF parser
    - CAD layer extraction
    - PDF image OCR
    - Computer vision plan measurement
    """

    filename = os.path.basename(file_path).lower()

    # Demo logic:
    # If filename contains "fail", return failed measurements
    if "fail" in filename or "reject" in filename:
        return {
            "front_setback_m": 2.2,
            "rear_setback_m": 1.4,
            "left_setback_m": 1.1,
            "right_setback_m": 1.3,
            "road_width_m": 7.5,
            "fsi": 1.9,
            "plot_area_sq_m": 200,
            "builtup_area_sq_m": 380,
        }

    return {
        "front_setback_m": round(random.uniform(3.0, 4.5), 2),
        "rear_setback_m": round(random.uniform(2.0, 3.5), 2),
        "left_setback_m": round(random.uniform(1.5, 2.5), 2),
        "right_setback_m": round(random.uniform(1.5, 2.5), 2),
        "road_width_m": round(random.uniform(9.0, 12.0), 2),
        "fsi": round(random.uniform(1.0, 1.45), 2),
        "plot_area_sq_m": 240,
        "builtup_area_sq_m": 320,
    }


def run_auto_dcr_scrutiny(file_path: str) -> Dict:
    measurements = mock_extract_plan_measurements(file_path)
    violations: List[Dict] = []

    if measurements["front_setback_m"] < DTCP_RULES["min_front_setback_m"]:
        violations.append({
            "rule": "Front Setback",
            "required": f'{DTCP_RULES["min_front_setback_m"]} m',
            "found": f'{measurements["front_setback_m"]} m',
            "message": "Front setback is below required limit."
        })

    if measurements["rear_setback_m"] < DTCP_RULES["min_rear_setback_m"]:
        violations.append({
            "rule": "Rear Setback",
            "required": f'{DTCP_RULES["min_rear_setback_m"]} m',
            "found": f'{measurements["rear_setback_m"]} m',
            "message": "Rear setback is below required limit."
        })

    if measurements["left_setback_m"] < DTCP_RULES["min_side_setback_m"]:
        violations.append({
            "rule": "Left Side Setback",
            "required": f'{DTCP_RULES["min_side_setback_m"]} m',
            "found": f'{measurements["left_setback_m"]} m',
            "message": "Left side setback is below required limit."
        })

    if measurements["right_setback_m"] < DTCP_RULES["min_side_setback_m"]:
        violations.append({
            "rule": "Right Side Setback",
            "required": f'{DTCP_RULES["min_side_setback_m"]} m',
            "found": f'{measurements["right_setback_m"]} m',
            "message": "Right side setback is below required limit."
        })

    if measurements["road_width_m"] < DTCP_RULES["min_road_width_m"]:
        violations.append({
            "rule": "Road Width",
            "required": f'{DTCP_RULES["min_road_width_m"]} m',
            "found": f'{measurements["road_width_m"]} m',
            "message": "Approach road width is insufficient."
        })

    if measurements["fsi"] > DTCP_RULES["max_fsi"]:
        violations.append({
            "rule": "FSI",
            "required": f'Max {DTCP_RULES["max_fsi"]}',
            "found": str(measurements["fsi"]),
            "message": "FSI exceeds permissible limit."
        })

    status = "PASSED" if len(violations) == 0 else "FAILED"

    return {
        "engine": "AI Auto-DCR Scrutiny",
        "status": status,
        "isCompliant": status == "PASSED",
        "measurements": measurements,
        "rules": DTCP_RULES,
        "violations": violations,
        "recommendation": (
            "Plan is compliant. Provisional technical approval can be generated."
            if status == "PASSED"
            else "Plan rejected. Applicant must correct listed violations and re-upload."
        )
    }