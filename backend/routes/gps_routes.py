from flask import Blueprint, jsonify, request
from ai.geo_validation import validate_gps_lock

gps_bp = Blueprint("gps", __name__)


@gps_bp.route("/api/field/validate-gps", methods=["POST"])
def field_validate_gps():
    """
    Validate field officer GPS location
    ---
    tags:
      - Field Verification
    consumes:
      - application/json
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - userLat
            - userLng
            - alertLat
            - alertLng
          properties:
            userLat:
              type: number
              example: 16.5201
            userLng:
              type: number
              example: 80.6412
            alertLat:
              type: number
              example: 16.5201
            alertLng:
              type: number
              example: 80.6412
    responses:
      200:
        description: GPS validation completed
      400:
        description: Missing required coordinates
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    required_fields = [
        "userLat",
        "userLng",
        "alertLat",
        "alertLng",
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    result = validate_gps_lock(
        float(data["userLat"]),
        float(data["userLng"]),
        float(data["alertLat"]),
        float(data["alertLng"]),
        50,
    )

    return jsonify({
        "success": True,
        "result": result
    })