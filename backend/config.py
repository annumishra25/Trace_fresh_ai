import os

# Load .env if python-dotenv is installed
try:
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path)
except ImportError:
    pass


class Config:
    """Centralized Application Configuration Manager."""
    FLASK_ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"
    PORT = int(os.environ.get("PORT", 5000))
    HOST = os.environ.get("HOST", "0.0.0.0")

    # Secrets
    SECRET_KEY = os.environ.get("SECRET_KEY", "tracefresh-default-local-secret-key-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "tracefresh-default-jwt-secret-key-2026")
    X_DEVICE_TOKEN = os.environ.get("X_DEVICE_TOKEN", "tracefresh-device-ingest-token-2026")

    # Database
    DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

    # Fallback to local SQLite DB if DATABASE_URL is not set
    if not DATABASE_URL:
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        db_path = os.path.join(data_dir, "tracefresh.db")
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{db_path}"
    else:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL

    # CORS Allowed Origins
    cors_raw = os.environ.get("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
    CORS_ORIGINS = [origin.strip() for origin in cors_raw.split(",") if origin.strip()]

    # Telemetry Configuration
    TELEMETRY_STALE_SECONDS = int(os.environ.get("TELEMETRY_STALE_SECONDS", 30))
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
