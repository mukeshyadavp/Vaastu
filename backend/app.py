from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
import os

from routes import register_routes


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
REPORT_FOLDER = os.path.join(BASE_DIR, "generated_reports")
STATIC_FOLDER = os.path.join(BASE_DIR, "static")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)


def create_app():
    app = Flask(
        __name__,
        static_folder=STATIC_FOLDER,
        static_url_path=""
    )

    app.config["BASE_DIR"] = BASE_DIR
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["REPORT_FOLDER"] = REPORT_FOLDER
    app.config["STATIC_FOLDER"] = STATIC_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                ]
            }
        },
        supports_credentials=True,
    )

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "VAASTU API",
            "description": (
                "VAASTU backend API for Auto-DCR scrutiny, compliance PDF reports, "
                "satellite monitoring, GPS validation and application workflows."
            ),
            "version": "1.0.0",
        },
        "basePath": "/",
        "schemes": ["http", "https"],
    }

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs",
    }

    Swagger(app, template=swagger_template, config=swagger_config)

    register_routes(app)

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

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )