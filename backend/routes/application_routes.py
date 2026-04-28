import os

from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename

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


def get_request_data():
    is_multipart = (
        request.content_type
        and request.content_type.startswith("multipart/form-data")
    )

    if is_multipart:
        return request.form

    return request.get_json(silent=True) or {}


def save_uploaded_file(uploaded_file):
    if not uploaded_file or not uploaded_file.filename:
        return None, None

    filename = secure_filename(uploaded_file.filename)

    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, filename)
    uploaded_file.save(file_path)

    file_url = f"/uploads/{filename}"

    return filename, file_url


def set_if_model_has(instance, model_attr, data, request_key):
    if hasattr(instance, model_attr) and request_key in data:
        value = data.get(request_key)
        setattr(instance, model_attr, value if value != "" else None)


@applications_bp.route("/api/applications", methods=["GET"])
def get_applications():
    applications = Application.query.order_by(Application.id.desc()).all()

    return jsonify({
        "success": True,
        "data": [item.to_dict() for item in applications],
    }), 200


@applications_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_uploaded_file(filename):
    upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    return send_from_directory(upload_folder, filename)


@applications_bp.route("/api/applications", methods=["POST"])
def create_application():
    data = get_request_data()

    if not data and "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No data provided",
        }), 400

    applicant_name = data.get("applicantName") or data.get("name")
    location = data.get("location")
    plot_size = data.get("plotSize")

    required_fields = {
        "applicantName": applicant_name,
        "location": location,
        "plotSize": plot_size,
    }

    for field, value in required_fields.items():
        if not value:
            return jsonify({
                "success": False,
                "message": f"{field} is required",
            }), 400

    new_application = Application(
        applicant_name=applicant_name,
        location=location,
        plot_size=plot_size,
        latitude=to_float_or_none(data.get("latitude")),
        longitude=to_float_or_none(data.get("longitude")),
        status=data.get("status", "Pending"),
    )

    # Applicant details
    set_if_model_has(new_application, "father_name", data, "fatherName")
    set_if_model_has(new_application, "mobile", data, "mobile")
    set_if_model_has(new_application, "email", data, "email")

    # Plot/location details
    set_if_model_has(new_application, "address", data, "address")
    set_if_model_has(new_application, "survey_no", data, "surveyNo")
    set_if_model_has(new_application, "plot_area", data, "plotArea")
    set_if_model_has(new_application, "land_type", data, "landType")

    # Building details
    set_if_model_has(new_application, "building_type", data, "buildingType")
    set_if_model_has(new_application, "floors", data, "floors")
    set_if_model_has(new_application, "height", data, "height")
    set_if_model_has(new_application, "builtup_area", data, "builtupArea")
    set_if_model_has(new_application, "road_width", data, "roadWidth")
    set_if_model_has(new_application, "front_setback", data, "frontSetback")
    set_if_model_has(new_application, "side_setback", data, "sideSetback")
    set_if_model_has(new_application, "rear_setback", data, "rearSetback")

    # Review details
    set_if_model_has(new_application, "remarks", data, "remarks")

    uploaded_file = request.files.get("file")
    filename, file_url = save_uploaded_file(uploaded_file)

    if filename and file_url:
        if hasattr(new_application, "file_name"):
            new_application.file_name = filename

        if hasattr(new_application, "file_url"):
            new_application.file_url = file_url

        if hasattr(new_application, "uploaded_file"):
            new_application.uploaded_file = file_url

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

    data = get_request_data()

    if not data and "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No data provided",
        }), 400

    # Required/main fields
    if "applicantName" in data:
        application.applicant_name = data.get("applicantName") or application.applicant_name

    if "name" in data and not data.get("applicantName"):
        application.applicant_name = data.get("name") or application.applicant_name

    if "location" in data:
        application.location = data.get("location") or application.location

    if "plotSize" in data:
        application.plot_size = data.get("plotSize") or application.plot_size

    if "status" in data:
        application.status = data.get("status") or application.status

    if "latitude" in data:
        application.latitude = to_float_or_none(data.get("latitude"))

    if "longitude" in data:
        application.longitude = to_float_or_none(data.get("longitude"))

    # Applicant details
    set_if_model_has(application, "father_name", data, "fatherName")
    set_if_model_has(application, "mobile", data, "mobile")
    set_if_model_has(application, "email", data, "email")

    # Plot/location details
    set_if_model_has(application, "address", data, "address")
    set_if_model_has(application, "survey_no", data, "surveyNo")
    set_if_model_has(application, "plot_area", data, "plotArea")
    set_if_model_has(application, "land_type", data, "landType")

    # Building details
    set_if_model_has(application, "building_type", data, "buildingType")
    set_if_model_has(application, "floors", data, "floors")
    set_if_model_has(application, "height", data, "height")
    set_if_model_has(application, "builtup_area", data, "builtupArea")
    set_if_model_has(application, "road_width", data, "roadWidth")
    set_if_model_has(application, "front_setback", data, "frontSetback")
    set_if_model_has(application, "side_setback", data, "sideSetback")
    set_if_model_has(application, "rear_setback", data, "rearSetback")

    # Review details
    set_if_model_has(application, "remarks", data, "remarks")

    uploaded_file = request.files.get("file")
    filename, file_url = save_uploaded_file(uploaded_file)

    if filename and file_url:
        if hasattr(application, "file_name"):
            application.file_name = filename

        if hasattr(application, "file_url"):
            application.file_url = file_url

        if hasattr(application, "uploaded_file"):
            application.uploaded_file = file_url

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