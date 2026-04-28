import os
from flask import Blueprint, jsonify, request, current_app
from extensions import db
from models.application import Application
from werkzeug.utils import secure_filename, send_from_directory
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
    """
    Get all applications
    ---
    tags:
      - Applications
    responses:
      200:
        description: Application list returned successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            data:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                    example: 1
                  applicantName:
                    type: string
                    example: Ramesh Kumar
                  status:
                    type: string
                    example: Pending
                  location:
                    type: string
                    example: Vijayawada
                  plotSize:
                    type: string
                    example: 250 Sq Yards
                  latitude:
                    type: number
                    example: 16.5062
                  longitude:
                    type: number
                    example: 80.6480
    """
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
    is_multipart = (
        request.content_type
        and request.content_type.startswith("multipart/form-data")
    )

    if is_multipart:
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

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

    latitude = to_float_or_none(data.get("latitude"))
    longitude = to_float_or_none(data.get("longitude"))

    new_application = Application(
        applicant_name=applicant_name,
        location=location,
        plot_size=plot_size,
        latitude=latitude,
        longitude=longitude,
        status=data.get("status", "Pending"),
    )

    # Optional fields if your model has these columns
    def set_if_model_has(model_attr, request_key):
        if hasattr(new_application, model_attr):
            setattr(new_application, model_attr, data.get(request_key) or None)

    set_if_model_has("father_name", "fatherName")
    set_if_model_has("mobile", "mobile")
    set_if_model_has("email", "email")
    set_if_model_has("address", "address")
    set_if_model_has("survey_no", "surveyNo")
    set_if_model_has("plot_area", "plotArea")
    set_if_model_has("building_type", "buildingType")
    set_if_model_has("floors", "floors")
    set_if_model_has("height", "height")
    set_if_model_has("remarks", "remarks")

    # Extra fields from your building permission form
    set_if_model_has("road_width", "roadWidth")
    set_if_model_has("land_type", "landType")
    set_if_model_has("builtup_area", "builtupArea")
    set_if_model_has("front_setback", "frontSetback")
    set_if_model_has("side_setback", "sideSetback")
    set_if_model_has("rear_setback", "rearSetback")

    uploaded_file = request.files.get("file")

    if uploaded_file and uploaded_file.filename:
        filename = secure_filename(uploaded_file.filename)

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        os.makedirs(upload_folder, exist_ok=True)

        file_path = os.path.join(upload_folder, filename)
        uploaded_file.save(file_path)

        file_url = f"/uploads/{filename}"

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
    """
    Get application by ID
    ---
    tags:
      - Applications
    parameters:
      - name: application_id
        in: path
        type: integer
        required: true
        description: Application ID
        example: 1
    responses:
      200:
        description: Application returned successfully
      404:
        description: Application not found
    """
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

    is_multipart = request.content_type and request.content_type.startswith("multipart/form-data")

    if is_multipart:
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

    if not data and "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No data provided",
        }), 400

    def update_if_exists(model_attr, request_key):
        if hasattr(application, model_attr) and request_key in data:
            setattr(application, model_attr, data.get(request_key))

    # Existing columns
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

    # Optional extra columns, only updated if your model has them
    update_if_exists("father_name", "fatherName")
    update_if_exists("mobile", "mobile")
    update_if_exists("email", "email")
    update_if_exists("address", "address")
    update_if_exists("survey_no", "surveyNo")
    update_if_exists("plot_area", "plotArea")
    update_if_exists("building_type", "buildingType")
    update_if_exists("floors", "floors")
    update_if_exists("height", "height")
    update_if_exists("remarks", "remarks")

    # File upload support
    uploaded_file = request.files.get("file")

    if uploaded_file and uploaded_file.filename:
        filename = secure_filename(uploaded_file.filename)

        upload_folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
        os.makedirs(upload_folder, exist_ok=True)

        file_path = os.path.join(upload_folder, filename)
        uploaded_file.save(file_path)

        file_url = f"/uploads/{filename}"

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
    """
    Approve application
    ---
    tags:
      - Applications
    parameters:
      - name: application_id
        in: path
        type: integer
        required: true
        description: Application ID
        example: 1
    responses:
      200:
        description: Application approved successfully
      404:
        description: Application not found
    """
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
    """
    Reject application
    ---
    tags:
      - Applications
    parameters:
      - name: application_id
        in: path
        type: integer
        required: true
        description: Application ID
        example: 1
    responses:
      200:
        description: Application rejected successfully
      404:
        description: Application not found
    """
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
    """
    Delete application
    ---
    tags:
      - Applications
    parameters:
      - name: application_id
        in: path
        type: integer
        required: true
        description: Application ID
        example: 1
    responses:
      200:
        description: Application deleted successfully
      404:
        description: Application not found
    """
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