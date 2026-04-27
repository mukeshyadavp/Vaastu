from .health_routes import health_bp
from .application_routes import applications_bp
from .upload_routes import upload_bp
from .auto_dcr_routes import auto_dcr_bp
from .satellite_routes import satellite_bp
from .gps_routes import gps_bp
from .report_routes import reports_bp
from .react_routes import react_bp
from .cad_preview_routes import cad_preview_bp

def register_routes(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(applications_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(cad_preview_bp)
    app.register_blueprint(auto_dcr_bp)
    app.register_blueprint(satellite_bp)
    app.register_blueprint(gps_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(react_bp)