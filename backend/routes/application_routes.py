from flask import Blueprint, jsonify, request
from extensions import db
from models.application import Application

applications_bp = Blueprint("applications", __name__)


def to_float_or_none(value):
    if value in [None, ""]:
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


@applications_bp.route("/api/applications", methods=["GET"])
def get_applications():
    applications = Application.query.order_by(Application.id.desc()).all()

    return jsonify({
        "success": True,
        "data": [item.to_dict() for item in applications],
    }), 200


@applications_bp.route("/api/applications", methods=["POST"])
def create_application():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data provided",
        }), 400

    required_fields = ["applicantName", "location", "plotSize"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"{field} is required",
            }), 400

    latitude = to_float_or_none(data.get("latitude"))
    longitude = to_float_or_none(data.get("longitude"))

    new_application = Application(
        applicant_name=data["applicantName"],
        location=data["location"],
        plot_size=data["plotSize"],
        latitude=latitude,
        longitude=longitude,
        status=data.get("status", "Pending"),
    )

    db.session.add(new_application)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Application created successfully",
        "data": new_application.to_dict(),
    }), 201


@applications_bp.route("/api/applications/<int:application_id>", methods=["GET"])
def get_application(application_id):
    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found",
        }), 404

    return jsonify({
        "success": True,
        "data": application.to_dict(),
    }), 200


@applications_bp.route("/api/applications/<int:application_id>", methods=["PUT"])
def update_application(application_id):
    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found",
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data provided",
        }), 400

    application.applicant_name = data.get(
        "applicantName",
        application.applicant_name,
    )
    application.location = data.get("location", application.location)
    application.plot_size = data.get("plotSize", application.plot_size)
    application.status = data.get("status", application.status)

    if "latitude" in data:
        application.latitude = to_float_or_none(data.get("latitude"))

    if "longitude" in data:
        application.longitude = to_float_or_none(data.get("longitude"))

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Application updated successfully",
        "data": application.to_dict(),
    }), 200


@applications_bp.route("/api/applications/<int:application_id>/approve", methods=["PUT"])
def approve_application(application_id):
    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found",
        }), 404

    application.status = "Approved"
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Application approved",
        "data": application.to_dict(),
    }), 200


@applications_bp.route("/api/applications/<int:application_id>/reject", methods=["PUT"])
def reject_application(application_id):
    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found",
        }), 404

    application.status = "Rejected"
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Application rejected",
        "data": application.to_dict(),
    }), 200


@applications_bp.route("/api/applications/<int:application_id>", methods=["DELETE"])
def delete_application(application_id):
    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "success": False,
            "message": "Application not found",
        }), 404

    db.session.delete(application)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Application deleted successfully",
    }), 200