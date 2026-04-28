from typing import Dict, List

def mock_detect_new_structures(
    approved_permit_locations: List[Dict]
) -> List[Dict]:
    """
    Temporary satellite AI simulation.

    Later replace with:
    - Sentinel / drone image ingestion
    - UNet segmentation
    - Siamese change detection
    - PostGIS footprint comparison
    """

    detected = []

    for index, permit in enumerate(approved_permit_locations[:3], start=1):
        detected.append({
            "id": f"SAT-AUTH-{index:03d}",
            "lat": round(permit["lat"] + 0.00018, 6),
            "lng": round(permit["lng"] + 0.00016, 6),
            "detectedAreaSqM": permit.get("builtupAreaSqM", 145),
            "confidence": 0.93,
            "changeType": "Construction Progress",
            "imageT1": "Previous Month",
            "imageT2": "Current Month",
        })

    if approved_permit_locations:
        anchor = approved_permit_locations[0]
        unauthorized_lat = round(anchor["lat"] + 0.0124, 6)
        unauthorized_lng = round(anchor["lng"] + 0.0091, 6)
    else:
        unauthorized_lat = 16.5201
        unauthorized_lng = 80.6412

    detected.append({
        "id": "SAT-ALERT-UNAUTH-001",
        "lat": unauthorized_lat,
        "lng": unauthorized_lng,
        "detectedAreaSqM": 220,
        "confidence": 0.88,
        "changeType": "Unauthorized Footprint",
        "imageT1": "Previous Month",
        "imageT2": "Current Month",
    })

    return detected


def is_matching_approved_permit(
    alert: Dict,
    approved_permit_locations: List[Dict]
) -> bool:
    for permit in approved_permit_locations:
        distance_score = abs(alert["lat"] - permit["lat"]) + abs(alert["lng"] - permit["lng"])

        if distance_score < 0.001 and permit["status"] == "Approved":
            return True

    return False


def run_satellite_change_detection(
    approved_permit_locations: List[Dict]
) -> Dict:
    detected_structures = mock_detect_new_structures(approved_permit_locations)
    alerts = []

    for structure in detected_structures:
        has_permit = is_matching_approved_permit(
            structure,
            approved_permit_locations
        )

        alerts.append({
            **structure,
            "permitFound": has_permit,
            "status": "Authorized Construction" if has_permit else "Unauthorized Anomaly",
            "severity": "Low" if has_permit else "High",
            "action": (
                "Update construction progress tracker."
                if has_permit
                else "Generate violation alert and assign field officer."
            )
        })

    unauthorized_count = len([item for item in alerts if not item["permitFound"]])

    return {
        "engine": "Satellite Sentinel AI",
        "scanStatus": "COMPLETED",
        "totalChangesDetected": len(alerts),
        "unauthorizedAlerts": unauthorized_count,
        "alerts": alerts
    }
