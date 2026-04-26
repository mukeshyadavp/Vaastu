from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check API
    ---
    tags:
      - Health
    responses:
      200:
        description: Backend connected successfully
    """
    return jsonify({
        "success": True,
        "message": "Backend connected successfully"
    })