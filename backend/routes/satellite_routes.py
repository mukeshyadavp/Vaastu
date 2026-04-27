from flask import Blueprint, jsonify
from ai.satellite_ai import run_satellite_change_detection

satellite_bp = Blueprint("satellite", __name__)


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
    result = run_satellite_change_detection()

    return jsonify({
        "success": True,
        "message": "Satellite change detection completed",
        "result": result
    })