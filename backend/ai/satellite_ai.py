import random
from typing import Dict, List


APPROVED_PERMIT_LOCATIONS = [
    {
        "permitId": "VAASTU-APP-1001",
        "lat": 16.5062,
        "lng": 80.6480,
        "radiusMeters": 80,
        "status": "Approved"
    }
]


def mock_detect_new_structures() -> List[Dict]:
    """
    Temporary satellite AI simulation.

    Later replace with:
    - Sentinel / drone image ingestion
    - UNet segmentation
    - Siamese change detection
    - PostGIS footprint comparison
    """

    return [
        {
            "id": "SAT-ALERT-001",
            "lat": 16.5065,
            "lng": 80.6483,
            "detectedAreaSqM": 145,
            "confidence": 0.92,
            "changeType": "New Construction",
            "imageT1": "Previous Month",
            "imageT2": "Current Month"
        },
        {
            "id": "SAT-ALERT-002",
            "lat": 16.5201,
            "lng": 80.6412,
            "detectedAreaSqM": 220,
            "confidence": 0.88,
            "changeType": "Unauthorized Footprint",
            "imageT1": "Previous Month",
            "imageT2": "Current Month"
        }
    ]


def is_matching_approved_permit(alert: Dict) -> bool:
    for permit in APPROVED_PERMIT_LOCATIONS:
        distance_score = abs(alert["lat"] - permit["lat"]) + abs(alert["lng"] - permit["lng"])

        if distance_score < 0.001 and permit["status"] == "Approved":
            return True

    return False


def run_satellite_change_detection() -> Dict:
    detected_structures = mock_detect_new_structures()
    alerts = []

    for structure in detected_structures:
        has_permit = is_matching_approved_permit(structure)

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