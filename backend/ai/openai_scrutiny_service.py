import json
import os
import re
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")


DEFAULT_MODEL = "gpt-4o-mini"


def is_openai_enabled() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured")

    return OpenAI(api_key=api_key)


def clean_json_text(text: str) -> str:
    """
    Removes markdown code fences if model accidentally returns them.
    """
    text = text.strip()

    text = re.sub(r"^```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"^```\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    return text.strip()


def safe_json_loads(text: str) -> Dict[str, Any]:
    try:
        return json.loads(clean_json_text(text))
    except Exception:
        return {
            "summary": text,
            "riskLevel": "UNKNOWN",
            "citizenMessage": text,
            "officerNotes": [],
            "correctionSteps": [],
            "missingInputs": [],
        }


def trim_debug_payload(cad_debug: Dict[str, Any]) -> Dict[str, Any]:
    """
    Keeps OpenAI payload small. Full DXF debug can become large.
    """
    if not cad_debug:
        return {}

    return {
        "plotPolygon": cad_debug.get("plotPolygon", {}),
        "buildingPolygon": cad_debug.get("buildingPolygon", {}),
        "skippedPlotEntitiesCount": len(cad_debug.get("skippedPlotEntities", [])),
        "skippedBuildingEntitiesCount": len(
            cad_debug.get("skippedBuildingEntities", [])
        ),
    }


def normalize_ai_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures frontend/PDF always receives stable keys.
    """
    risk_level = str(data.get("riskLevel", "UNKNOWN")).upper()

    if risk_level not in ["LOW", "MEDIUM", "HIGH", "UNKNOWN"]:
        risk_level = "UNKNOWN"

    return {
        "enabled": True,
        "model": data.get("model", os.getenv("OPENAI_MODEL", DEFAULT_MODEL)),
        "summary": str(data.get("summary", "")),
        "riskLevel": risk_level,
        "citizenMessage": str(data.get("citizenMessage", "")),
        "officerNotes": data.get("officerNotes", [])
        if isinstance(data.get("officerNotes", []), list)
        else [],
        "correctionSteps": data.get("correctionSteps", [])
        if isinstance(data.get("correctionSteps", []), list)
        else [],
        "missingInputs": data.get("missingInputs", [])
        if isinstance(data.get("missingInputs", []), list)
        else [],
    }


def disabled_response(message: str) -> Dict[str, Any]:
    return {
        "enabled": False,
        "model": os.getenv("OPENAI_MODEL", DEFAULT_MODEL),
        "summary": message,
        "riskLevel": "UNKNOWN",
        "citizenMessage": "",
        "officerNotes": [],
        "correctionSteps": [],
        "missingInputs": [],
    }


def generate_ai_scrutiny_explanation(
    auto_dcr_result: Dict[str, Any],
    application_data: Optional[Dict[str, Any]] = None,
    cad_debug: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    OpenAI advisor layer for VAASTU Auto-DCR.

    Important:
    - This function does NOT approve or reject the plan.
    - Approval/rejection must come only from deterministic Auto-DCR rules.
    - OpenAI explains the result in citizen-friendly and officer-friendly language.
    """

    if not is_openai_enabled():
        return disabled_response(
            "OpenAI analysis is disabled because OPENAI_API_KEY is not configured."
        )

    application_data = application_data or {}
    cad_debug = cad_debug or {}

    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)

    payload = {
        "applicationData": application_data,
        "autoDcrResult": {
            "engine": auto_dcr_result.get("engine"),
            "status": auto_dcr_result.get("status"),
            "isCompliant": auto_dcr_result.get("isCompliant"),
            "summary": auto_dcr_result.get("summary", {}),
            "measurements": auto_dcr_result.get("measurements", {}),
            "rules": auto_dcr_result.get("rules", {}),
            "violations": auto_dcr_result.get("violations", []),
            "recommendation": auto_dcr_result.get("recommendation", ""),
        },
        "cadDebug": trim_debug_payload(cad_debug),
    }

    system_prompt = """
You are VAASTU AI, an assistant for automated building permission scrutiny.

You must NOT change the compliance status.
You must NOT approve or reject the plan.
You must NOT invent measurements.
You must explain only based on the given deterministic Auto-DCR result.

The deterministic rule engine is the source of truth.
Your role is only to explain the result clearly.
"""

    user_prompt = f"""
Analyze the Auto-DCR result and return applicant/officer-friendly explanation.

Rules:
- If status is PASSED, explain why it is compliant.
- If status is FAILED, explain the violations clearly.
- Mention setback, FAR, road width, parking, room, rain water, or fire NOC issues only if present in the result.
- Keep language professional and concise.
- Do not provide legal certification.
- Do not override Auto-DCR status.

DATA:
{json.dumps(payload, indent=2)}
"""

    try:
        client = get_openai_client()

        response = client.responses.create(
            model=model,
            input=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            text={
                "format": {
                    "type": "json_schema",
                    "name": "vaastu_ai_scrutiny_explanation",
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "summary": {"type": "string"},
                            "riskLevel": {
                                "type": "string",
                                "enum": ["LOW", "MEDIUM", "HIGH", "UNKNOWN"],
                            },
                            "citizenMessage": {"type": "string"},
                            "officerNotes": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "correctionSteps": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "missingInputs": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                        "required": [
                            "summary",
                            "riskLevel",
                            "citizenMessage",
                            "officerNotes",
                            "correctionSteps",
                            "missingInputs",
                        ],
                    },
                    "strict": True,
                }
            },
            temperature=0.2,
        )

        parsed = safe_json_loads(response.output_text)
        parsed["model"] = model

        return normalize_ai_response(parsed)

    except Exception as error:
        return disabled_response(f"OpenAI analysis failed: {str(error)}")