from flask import Blueprint, jsonify, request

applications_bp = Blueprint("applications", __name__)

applications = [
    {
        "id": 1,
        "applicantName": "Ramesh Kumar",
        "status": "Pending",
        "location": "Vijayawada",
        "plotSize": "250 Sq Yards",
    },
    {
        "id": 2,
        "applicantName": "Suresh Reddy",
        "status": "Approved",
        "location": "Guntur",
        "plotSize": "300 Sq Yards",
    },
]


@applications_bp.route("/api/applications", methods=["GET"])
def get_applications():
    """
    Get all applications
    ---
    tags:
      - Applications
    responses:
      200:
        description: Application list returned successfully
    """
    return jsonify({
        "success": True,
        "data": applications
    })


@applications_bp.route("/api/applications", methods=["POST"])
def create_application():
    """
    Create new application
    ---
    tags:
      - Applications
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data provided"
        }), 400

    required_fields = ["applicantName", "location", "plotSize"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"{field} is required"
            }), 400

    new_application = {
        "id": len(applications) + 1,
        "applicantName": data["applicantName"],
        "location": data["location"],
        "plotSize": data["plotSize"],
        "status": data.get("status", "Pending"),
    }

    applications.append(new_application)

    return jsonify({
        "success": True,
        "message": "Application created successfully",
        "data": new_application
    }), 201


@applications_bp.route("/api/applications/<int:application_id>/approve", methods=["PUT"])
def approve_application(application_id):
    """
    Approve application
    ---
    tags:
      - Applications
    """
    for app_item in applications:
        if app_item["id"] == application_id:
            app_item["status"] = "Approved"

            return jsonify({
                "success": True,
                "message": "Application approved",
                "data": app_item
            })

    return jsonify({
        "success": False,
        "message": "Application not found"
    }), 404


@applications_bp.route("/api/applications/<int:application_id>/reject", methods=["PUT"])
def reject_application(application_id):
    """
    Reject application
    ---
    tags:
      - Applications
    """
    for app_item in applications:
        if app_item["id"] == application_id:
            app_item["status"] = "Rejected"

            return jsonify({
                "success": True,
                "message": "Application rejected",
                "data": app_item
            })

    return jsonify({
        "success": False,
        "message": "Application not found"
    }), 404