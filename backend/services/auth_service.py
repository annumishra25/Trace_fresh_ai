import logging
from datetime import datetime, timedelta, timezone
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from database.db import get_db_session
from database.models import UserModel

logger = logging.getLogger("tracefresh.auth")


def hash_password(password):
    """Hashes password securely using Werkzeug PBKDF2/scrypt."""
    return generate_password_hash(password)


def verify_password(password, password_hash):
    """Verifies a plain password against stored hash."""
    return check_password_hash(password_hash, password)


def generate_jwt_token(user_id, username, role, expires_in_hours=24):
    """Generates a signed JWT authentication token."""
    now = datetime.now(timezone.utc)
    payload = {
        "userId": user_id,
        "username": username,
        "role": role,
        "iat": now,
        "exp": now + timedelta(hours=expires_in_hours)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")


def decode_jwt_token(token):
    """
    Decodes and validates a JWT token.
    Returns decoded payload or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Expired JWT token received")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token received")
        return None


def authenticate_user(username, password):
    """
    Validates user credentials and returns JWT token and user profile.
    """
    session = get_db_session()
    try:
        user = session.query(UserModel).filter_by(username=username).first()
        if not user or not verify_password(password, user.password_hash):
            return None, "Invalid username or password"

        token = generate_jwt_token(user.id, user.username, user.role)
        return {
            "token": token,
            "user": user.to_dict()
        }, None
    finally:
        session.close()


def seed_default_users():
    """
    Seeds initial default users on application startup.
    Uses unique, non-common passwords to avoid browser data-breach warning triggers.
    Default Accounts:
    - admin / TraceFresh#2026!Admin (ADMIN)
    - operator / TraceFresh#2026!Op (OPERATOR)
    - viewer / TraceFresh#2026!View (VIEWER)
    """
    session = get_db_session()
    try:
        defaults = [
            ("admin", "TraceFresh#2026!Admin", "admin@tracefresh.ai", "ADMIN"),
            ("operator", "TraceFresh#2026!Op", "operator@tracefresh.ai", "OPERATOR"),
            ("viewer", "TraceFresh#2026!View", "viewer@tracefresh.ai", "VIEWER")
        ]
        for username, pwd, email, role in defaults:
            existing = session.query(UserModel).filter_by(username=username).first()
            if not existing:
                user = UserModel(
                    username=username,
                    password_hash=hash_password(pwd),
                    email=email,
                    role=role
                )
                session.add(user)
            else:
                # Update hash to new unique password
                existing.password_hash = hash_password(pwd)
        session.commit()
        logger.info("Default user accounts verified and updated.")
    except Exception as e:
        session.rollback()
        logger.error(f"Failed to seed default users: {e}")
    finally:
        session.close()
