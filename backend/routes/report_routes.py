from flask import Blueprint, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import os

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/api/reports/<filename>", methods=["GET"])
def download_report(filename):
    """
    Download generated compliance PDF
    ---
    tags:
      - Reports
    parameters:
      - name: filename
        in: path
        type: string
        required: true
    responses:
      200:
        description: PDF file download
      404:
        description: Report not found
    """
    safe_filename = secure_filename(filename)
    file_path = os.path.join(current_app.config["REPORT_FOLDER"], safe_filename)

    if not os.path.exists(file_path):
        return jsonify({
            "success": False,
            "message": "Report not found"
        }), 404

    return send_file(
        file_path,
        as_attachment=True,
        download_name=safe_filename,
        mimetype="application/pdf"
    )