from flask import Blueprint, jsonify, send_from_directory, current_app
import os

react_bp = Blueprint("react", __name__)


@react_bp.route("/")
def serve_root():
    index_path = os.path.join(current_app.static_folder, "index.html")

    if not os.path.exists(index_path):
        return jsonify({
            "success": False,
            "message": "React build not found. Run npm run build first."
        }), 404

    return send_from_directory(current_app.static_folder, "index.html")


@react_bp.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(current_app.static_folder, path)

    if os.path.exists(file_path):
        return send_from_directory(current_app.static_folder, path)

    index_path = os.path.join(current_app.static_folder, "index.html")

    if not os.path.exists(index_path):
        return jsonify({
            "success": False,
            "message": "React build not found. Run npm run build first."
        }), 404

    return send_from_directory(current_app.static_folder, "index.html")