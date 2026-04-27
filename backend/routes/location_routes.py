import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from flask import Blueprint, jsonify, request

location_bp = Blueprint("location", __name__)


@location_bp.route("/api/location/search", methods=["GET"])
def search_location():
    """
    Search location using OpenStreetMap Nominatim
    ---
    tags:
      - Location
    parameters:
      - name: q
        in: query
        type: string
        required: true
        description: Location search text
    responses:
      200:
        description: Location suggestions returned
      400:
        description: Missing query
      500:
        description: Location search failed
    """

    query = request.args.get("q", "").strip()

    if not query:
        return jsonify({
            "success": True,
            "data": [],
        }), 200

    params = urlencode({
        "format": "json",
        "q": query,
        "limit": 6,
        "addressdetails": 1,
    })

    url = f"https://nominatim.openstreetmap.org/search?{params}"

    nominatim_request = Request(
        url,
        headers={
            "User-Agent": "Vaastu-App/1.0",
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(nominatim_request, timeout=10) as response:
            response_body = response.read().decode("utf-8")
            data = json.loads(response_body)

        return jsonify({
            "success": True,
            "data": data,
        }), 200

    except HTTPError as error:
        return jsonify({
            "success": False,
            "message": f"Nominatim HTTP error: {error.code}",
            "data": [],
        }), 500

    except URLError as error:
        return jsonify({
            "success": False,
            "message": f"Nominatim connection error: {str(error.reason)}",
            "data": [],
        }), 500

    except Exception as error:
        return jsonify({
            "success": False,
            "message": f"Location search failed: {str(error)}",
            "data": [],
        }), 500