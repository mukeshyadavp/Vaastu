import os
import uuid
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename

from ai.cad_preview_service import generate_cad_preview

cad_preview_bp = Blueprint("cad_preview", __name__)


@cad_preview_bp.route("/api/cad/preview", methods=["POST"])
def create_cad_preview():
    """
    Generate CAD preview
    ---
    tags:
      - CAD Preview
    consumes:
      - multipart/form-data
    parameters:
      - name: file
        in: formData
        type: file
        required: true
        description: DXF file for preview. DWG upload is accepted but preview is disabled on Render free.
    responses:
      200:
        description: CAD preview generated successfully
      400:
        description: Invalid request
      500:
        description: Preview generation failed
    """

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "CAD file is required",
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected",
        }), 400

    filename = secure_filename(file.filename)
    file_ext = os.path.splitext(filename)[1].lower()

    if file_ext not in [".dxf", ".dwg"]:
        return jsonify({
            "success": False,
            "message": "Preview is supported only for DXF files on Render free",
        }), 400

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    preview_folder = current_app.config.get(
        "PREVIEW_FOLDER",
        os.path.join(current_app.config["BASE_DIR"], "generated_previews"),
    )

    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(preview_folder, exist_ok=True)

    saved_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(upload_folder, saved_filename)

    file.save(file_path)

    try:
        preview_filename = generate_cad_preview(file_path, preview_folder)

        return jsonify({
            "success": True,
            "message": "CAD preview generated successfully",
            "previewUrl": f"/api/cad/previews/{preview_filename}",
        }), 200

    except Exception as error:
        return jsonify({
            "success": False,
            "message": f"CAD preview failed: {str(error)}",
        }), 500


@cad_preview_bp.route("/api/cad/previews/<path:filename>", methods=["GET"])
def get_cad_preview(filename):
    preview_folder = current_app.config.get(
        "PREVIEW_FOLDER",
        os.path.join(current_app.config["BASE_DIR"], "generated_previews"),
    )

    return send_from_directory(preview_folder, filename)