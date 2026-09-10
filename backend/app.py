import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from database.db import init_db, get_db_session
from services.auth_service import seed_default_users

from routes.auth_routes import auth_bp
from routes.inspection_routes import inspection_bp
from routes.batch_routes import batch_bp
from routes.sensor_routes import sensor_bp
from routes.prediction_routes import prediction_bp
from routes.telemetry_routes import telemetry_bp
from routes.route_routes import route_bp
from routes.sensor_intelligence_routes import sensor_intelligence_bp
from routes.fusion_routes import fusion_bp
from routes.qr_routes import qr_bp

# Configure application logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tracefresh.app")

# Initialize Flask application
app = Flask(__name__)
app.config.from_object(Config)

# CORS Configuration (Permissive for development, strict in production)
if Config.FLASK_ENV == "production" and Config.CORS_ORIGINS:
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
else:
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Register API blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(batch_bp)
app.register_blueprint(sensor_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(inspection_bp)
app.register_blueprint(telemetry_bp)
app.register_blueprint(route_bp)
app.register_blueprint(sensor_intelligence_bp)
app.register_blueprint(fusion_bp)
app.register_blueprint(qr_bp)

# Initialize Database & Default Seed Users on startup
with app.app_context():
    try:
        init_db()
        seed_default_users()
    except Exception as e:
        logger.error(f"Error during startup database initialization: {e}")


# Security Headers Middleware
@app.after_request
def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# Health Check Endpoints
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "UP",
        "service": "TraceFresh-AI Backend",
        "environment": Config.FLASK_ENV
    })


@app.route("/api/health/db", methods=["GET"])
def health_db_check():
    session = get_db_session()
    try:
        session.execute("SELECT 1")
        return jsonify({
            "status": "UP",
            "database": "REACHABLE",
            "uri_type": "SQLite" if Config.SQLALCHEMY_DATABASE_URI.startswith("sqlite") else "PostgreSQL"
        })
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return jsonify({
            "status": "DOWN",
            "database": "UNREACHABLE",
            "error": str(e) if Config.DEBUG else "Database connection failed"
        }), 500
    finally:
        session.close()


@app.route("/")
def home():
    return jsonify({
        "message": "TraceFresh AI Cloud-Ready Backend is Running",
        "version": "1.0.0",
        "services": [
            "/api/health",
            "/api/health/db",
            "/api/auth/login",
            "/api/batches",
            "/api/telemetry",
            "/api/routes",
            "/api/fusion/batch/<batch_id>",
            "/api/public/verify/<token>"
        ]
    })


# Global Centralized JSON Error Handlers
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"success": False, "error": {"code": "BAD_REQUEST", "message": str(e.description)}}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"success": False, "error": {"code": "UNAUTHORIZED", "message": str(e.description)}}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"success": False, "error": {"code": "FORBIDDEN", "message": str(e.description)}}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": {"code": "NOT_FOUND", "message": "Requested resource not found"}}), 404

@app.errorhandler(429)
def too_many_requests(e):
    return jsonify({"success": False, "error": {"code": "TOO_MANY_REQUESTS", "message": "Rate limit exceeded"}}), 429

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Unhandled server error: {e}")
    msg = str(e) if Config.DEBUG else "An internal server error occurred"
    return jsonify({"success": False, "error": {"code": "INTERNAL_SERVER_ERROR", "message": msg}}), 500


if __name__ == "__main__":
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)