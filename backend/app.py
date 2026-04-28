import os

# Must be set before any matplotlib/CAD preview import happens
os.environ.setdefault("MPLCONFIGDIR", "/tmp/matplotlib")
os.makedirs("/tmp/matplotlib", exist_ok=True)

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flasgger import Swagger
from dotenv import load_dotenv
from sqlalchemy import text

from extensions import db
from routes import register_routes

# Import models so db.create_all() can detect tables
from models.application import Application  # noqa: F401


load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
REPORT_FOLDER = os.path.join(BASE_DIR, "generated_reports")
STATIC_FOLDER = os.path.join(BASE_DIR, "static")
PREVIEW_FOLDER = os.path.join(BASE_DIR, "generated_previews")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(REPORT_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)
os.makedirs(PREVIEW_FOLDER, exist_ok=True)


def get_database_url():
    flask_env = os.getenv("FLASK_ENV", "development").lower()
    database_url = os.getenv("DATABASE_URL", "").strip()

    # Local Windows/Python 3.14: force SQLite unless explicitly production
    if flask_env != "production":
        return "sqlite:///vaastu.db"

    if not database_url:
        return "sqlite:///vaastu.db"

    # Render sometimes provides postgres:// but SQLAlchemy needs postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return database_url


def create_app():
    app = Flask(
        __name__,
        static_folder=STATIC_FOLDER,
        static_url_path="",
    )

    app.config["BASE_DIR"] = BASE_DIR
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["REPORT_FOLDER"] = REPORT_FOLDER
    app.config["STATIC_FOLDER"] = STATIC_FOLDER
    app.config["PREVIEW_FOLDER"] = PREVIEW_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024

    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_url()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:5000",
                    "http://127.0.0.1:5000",
                    "https://vaastu-lhhg.vercel.app",
                    "https://vaastu-fullstack.onrender.com",
                ]
            }
        },
        supports_credentials=True,
    )

    db.init_app(app)

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

    @app.route("/api/health")
    def health_check():
        return jsonify({
            "success": True,
            "message": "Backend connected successfully",
            "database": "connected",
        }), 200

    # ------------------------------------------------------------------
    # React / Vite frontend serving
    # ------------------------------------------------------------------
    @app.route("/")
    def serve_index():
        index_path = os.path.join(app.config["STATIC_FOLDER"], "index.html")

        if os.path.exists(index_path):
            return send_from_directory(
                app.config["STATIC_FOLDER"],
                "index.html",
            )

        return jsonify({
            "success": True,
            "message": "VAASTU backend is running",
            "frontend": "React build not found in backend/static",
        }), 200

    @app.route("/<path:path>")
    def serve_react_or_static(path):
        """
        Handles:
        - Static frontend files: /assets/...
        - React routes: /admin, /dashboard, /Home
        - API 404: /api/unknown
        """

        # Keep API errors as JSON
        if path.startswith("api/"):
            return jsonify({
                "success": False,
                "message": "API route not found",
            }), 404

        # Do not break Swagger routes
        if (
            path.startswith("apidocs")
            or path.startswith("apispec")
            or path.startswith("flasgger_static")
        ):
            return jsonify({
                "success": False,
                "message": "Swagger route not found",
            }), 404

        static_file_path = os.path.join(app.config["STATIC_FOLDER"], path)

        # Serve existing static files like JS, CSS, images
        if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
            return send_from_directory(app.config["STATIC_FOLDER"], path)

        # React Router fallback for /admin, /dashboard, /Home, etc.
        index_path = os.path.join(app.config["STATIC_FOLDER"], "index.html")

        if os.path.exists(index_path):
            return send_from_directory(
                app.config["STATIC_FOLDER"],
                "index.html",
            )

        return jsonify({
            "success": False,
            "message": (
                "Frontend build not found. Run 'npm run build' in frontend "
                "and copy frontend/dist files into backend/static."
            ),
        }), 404

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "message": "API route not found",
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Internal server error",
        }), 500

    with app.app_context():
        try:
            db.create_all()

            db.session.execute(text("SELECT 1"))
            db.session.commit()

            print("Database connected successfully")
            print(
                "Database URI:",
                app.config["SQLALCHEMY_DATABASE_URI"].split("@")[-1],
            )

        except Exception as error:
            db.session.rollback()
            print("Database connection failed")
            print(f"Error: {str(error)}")

    return app


app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
    )