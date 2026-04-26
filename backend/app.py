from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
import os
from ai.auto_dcr import run_auto_dcr_scrutiny
from ai.satellite_ai import run_satellite_change_detection
from ai.geo_validation import validate_gps_lock
from werkzeug.utils import secure_filename
from flask import send_file
from ai.compliance_pdf import generate_compliance_pdf
from datetime import datetime
import uuid
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
REPORT_FOLDER = os.path.join(BASE_DIR, "generated_reports")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)
app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "static"),
    static_url_path=""
)
app = Flask(
    __name__,
    static_folder="static",
    static_url_path=""
)

app.config.from_object(Config)

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    },
    supports_credentials=True
)

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

applications = [
    {
        "id": 1,
        "applicantName": "Ramesh Kumar",
        "status": "Pending",
        "location": "Vijayawada",
        "plotSize": "250 Sq Yards"
    },
    {
        "id": 2,
        "applicantName": "Suresh Reddy",
        "status": "Approved",
        "location": "Guntur",
        "plotSize": "300 Sq Yards"
    }
]


# ── API Routes ────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "success",
        "message": "Backend connected successfully"
    })


@app.route("/api/applications", methods=["GET"])
def get_applications():
    return jsonify({
        "success": True,
        "data": applications
    })


@app.route("/api/applications", methods=["POST"])
def create_application():
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
        "status": data.get("status", "Pending")
    }

    applications.append(new_application)

    return jsonify({
        "success": True,
        "message": "Application created successfully",
        "data": new_application
    }), 201


@app.route("/api/applications/<int:application_id>/approve", methods=["PUT"])
def approve_application(application_id):
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


@app.route("/api/applications/<int:application_id>/reject", methods=["PUT"])
def reject_application(application_id):
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


@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No file uploaded"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No selected file"
        }), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
    file.save(file_path)

    return jsonify({
        "success": True,
        "message": "File uploaded successfully",
        "filename": unique_filename
    })

@app.route("/api/ai/auto-dcr", methods=["POST"])
def ai_auto_dcr():
    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "Building plan file is required"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected"
        }), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)

    file.save(file_path)

    result = run_auto_dcr_scrutiny(file_path)

    application_no = "AP-VAASTU-" + datetime.now().strftime("%Y%m%d%H%M%S")
    pdf_filename = f"{application_no}-Compliance-Report.pdf"
    pdf_path = os.path.join(REPORT_FOLDER, pdf_filename)

    application_data = {
        "applicationNo": application_no,
        "buildingType": request.form.get("buildingType", "Residential"),
        "floors": int(request.form.get("floors", 2)),
        "height": float(request.form.get("height", 7.0)),
        "classification": request.form.get("classification", "Non-High-Rise"),
    }

    pdf_result = generate_compliance_pdf(
        output_path=pdf_path,
        auto_dcr_result=result,
        application_data=application_data
    )

    return jsonify({
        "success": True,
        "message": "AI Auto-DCR scrutiny completed",
        "filename": unique_filename,
        "result": result,
        "pdf": {
            "applicationNo": pdf_result["applicationNo"],
            "status": pdf_result["status"],
            "downloadUrl": f"/api/reports/{pdf_filename}"
        }
    })

@app.route("/api/reports/<filename>", methods=["GET"])
def download_report(filename):
    file_path = os.path.join(REPORT_FOLDER, filename)

    if not os.path.exists(file_path):
        return jsonify({
            "success": False,
            "message": "Report not found"
        }), 404

    return send_file(
        file_path,
        as_attachment=True,
        download_name=filename,
        mimetype="application/pdf"
    )

@app.route("/api/ai/satellite-scan", methods=["POST"])
def ai_satellite_scan():
    result = run_satellite_change_detection()

    return jsonify({
        "success": True,
        "message": "Satellite change detection completed",
        "result": result
    })


@app.route("/api/field/validate-gps", methods=["POST"])
def field_validate_gps():
    data = request.get_json()

    required_fields = [
        "userLat",
        "userLng",
        "alertLat",
        "alertLng"
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
        50
    )

    return jsonify({
        "success": True,
        "result": result
    })

# ── Serve React App (production) ──────────────────────────────────────────────

@app.route("/")
def serve_root():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

# ── Error Handlers ────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "API route not found"
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )