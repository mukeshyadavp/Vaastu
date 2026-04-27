from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid

from ai.auto_dcr import run_auto_dcr_scrutiny
from ai.compliance_pdf import generate_compliance_pdf
from ai.cad_extractor import extract_dxf_measurements
from ai.openai_scrutiny_service import generate_ai_scrutiny_explanation

auto_dcr_bp = Blueprint("auto_dcr", __name__)


@auto_dcr_bp.route("/api/ai/auto-dcr", methods=["POST"])
def ai_auto_dcr():
    """
    Run Auto-DCR scrutiny and generate compliance PDF
    ---
    tags:
      - AI Auto-DCR
    consumes:
      - multipart/form-data
    parameters:
      - name: file
        in: formData
        type: file
        required: true
      - name: buildingType
        in: formData
        type: string
        required: false
        default: Residential
      - name: floors
        in: formData
        type: number
        required: false
        default: 2
      - name: height
        in: formData
        type: number
        required: false
        default: 7.0
      - name: classification
        in: formData
        type: string
        required: false
        default: Non-High-Rise
      - name: plotArea
        in: formData
        type: number
        required: false
        default: 300
      - name: builtupArea
        in: formData
        type: number
        required: false
        default: 300
      - name: frontSetback
        in: formData
        type: number
        required: false
        default: 3.5
      - name: rearSetback
        in: formData
        type: number
        required: false
        default: 2.5
      - name: side1Setback
        in: formData
        type: number
        required: false
        default: 2.0
      - name: side2Setback
        in: formData
        type: number
        required: false
        default: 2.0
      - name: roadWidth
        in: formData
        type: number
        required: false
        default: 9
      - name: parkingPercent
        in: formData
        type: number
        required: false
        default: 40
      - name: roomArea
        in: formData
        type: number
        required: false
        default: 12
      - name: roomWidth
        in: formData
        type: number
        required: false
        default: 3
      - name: kitchenArea
        in: formData
        type: number
        required: false
        default: 6
      - name: rainWaterHarvesting
        in: formData
        type: boolean
        required: false
        default: true
      - name: fireNoc
        in: formData
        type: boolean
        required: false
        default: false
    responses:
      200:
        description: Auto-DCR completed and compliance PDF generated
      400:
        description: Missing file or invalid submitted data
      500:
        description: Auto-DCR or PDF generation failed
    """

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "Building plan file is required",
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No file selected",
        }), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    report_folder = current_app.config["REPORT_FOLDER"]

    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(report_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    submitted_data = request.form.to_dict()
    file_ext = os.path.splitext(filename)[1].lower()

    cad_debug = {}
    cad_measurements = None

    if file_ext == ".dxf":
        try:
            cad_measurements = extract_dxf_measurements(file_path)
            cad_debug = cad_measurements.get("debug", {})

            floors = int(float(submitted_data.get("floors", 1)))
            builtup_area_ground = float(cad_measurements["builtupAreaGround"])

            submitted_data.update({
                "plotArea": cad_measurements["plotArea"],
                "builtupArea": builtup_area_ground * floors,
                "frontSetback": cad_measurements["frontSetback"],
                "rearSetback": cad_measurements["rearSetback"],
                "side1Setback": cad_measurements["side1Setback"],
                "side2Setback": cad_measurements["side2Setback"],
            })

        except Exception as error:
            return jsonify({
                "success": False,
                "message": f"DXF extraction failed: {str(error)}",
            }), 400

    try:
        result = run_auto_dcr_scrutiny(file_path, submitted_data)
    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error),
        }), 400
    except Exception as error:
        return jsonify({
            "success": False,
            "message": f"Auto-DCR scrutiny failed: {str(error)}",
        }), 500

    # ✅ OpenAI is used here
    # OpenAI does NOT approve/reject. Auto-DCR already decided that.
    # OpenAI only explains the result and correction steps.
    try:
        ai_analysis = generate_ai_scrutiny_explanation(
            auto_dcr_result=result,
            application_data=submitted_data,
            cad_debug=cad_debug,
        )

        result["aiAnalysis"] = ai_analysis

    except Exception as error:
        result["aiAnalysis"] = {
            "enabled": False,
            "summary": f"OpenAI explanation failed: {str(error)}",
            "riskLevel": "UNKNOWN",
            "citizenMessage": "",
            "officerNotes": [],
            "correctionSteps": [],
            "missingInputs": [],
        }

    application_no = "AP-VAASTU-" + datetime.now().strftime("%Y%m%d%H%M%S")
    pdf_filename = f"{application_no}-Compliance-Report.pdf"
    pdf_path = os.path.join(report_folder, pdf_filename)

    application_data = {
        "applicationNo": application_no,
        "buildingType": submitted_data.get("buildingType", "Residential"),
        "floors": int(float(submitted_data.get("floors", 2))),
        "height": float(submitted_data.get("height", 7.0)),
        "classification": submitted_data.get("classification", "Non-High-Rise"),
    }

    try:
        pdf_result = generate_compliance_pdf(
            output_path=pdf_path,
            auto_dcr_result=result,
            application_data=application_data,
        )
    except Exception as error:
        return jsonify({
            "success": False,
            "message": f"Compliance PDF generation failed: {str(error)}",
        }), 500

    return jsonify({
        "success": True,
        "message": "AI Auto-DCR scrutiny completed",
        "filename": unique_filename,
        "cadMeasurements": cad_measurements,
        "result": result,
        "pdf": {
            "applicationNo": pdf_result["applicationNo"],
            "status": pdf_result["status"],
            "downloadUrl": f"/api/reports/{pdf_filename}",
        },
    }), 200