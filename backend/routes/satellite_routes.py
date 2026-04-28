from flask import Blueprint, jsonify
from ai.satellite_ai import run_satellite_change_detection
from models.application import Application

satellite_bp = Blueprint("satellite", __name__)


def build_permit_locations():
    approved_applications = (
        Application.query
        .filter(Application.status == "Approved")
        .all()
    )

    permit_locations = []

    for application in approved_applications:
        if application.latitude is None or application.longitude is None:
            continue

        try:
            builtup_area = float(application.builtup_area or 0)
        except (TypeError, ValueError):
            builtup_area = 0

        permit_locations.append({
            "permitId": f"VAASTU-APP-{application.id}",
            "lat": float(application.latitude),
            "lng": float(application.longitude),
            "radiusMeters": 80,
            "status": application.status,
            "builtupAreaSqM": builtup_area or 145,
            "applicantName": application.applicant_name,
        })

    return permit_locations


@satellite_bp.route("/api/ai/satellite-scan", methods=["POST"])
def ai_satellite_scan():
    """
    Run satellite change detection scan
    ---
    tags:
      - Satellite AI
    responses:
      200:
        description: Satellite change detection completed
    """
    permit_locations = build_permit_locations()
    result = run_satellite_change_detection(permit_locations)

    return jsonify({
        "success": True,
        "message": "Satellite change detection completed",
        "metadata": {
            "approvedPermitsUsed": len(permit_locations),
        },
        "result": result
    })
