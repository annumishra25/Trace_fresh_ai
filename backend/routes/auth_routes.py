from flask import Blueprint, request, jsonify, g
from services.auth_service import authenticate_user, hash_password
from database.db import get_db_session
from database.models import UserModel
from utils.auth_decorators import require_auth, require_role
from utils.rate_limiter import rate_limit

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/api/auth/login", methods=["POST"])
@rate_limit(requests_per_minute=15)
def api_login():
    """
    Authenticates user credentials and issues a signed JWT token.
    """
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_INPUT",
                "message": "Username and password are required."
            }
        }), 400

    res, err = authenticate_user(username, password)
    if err:
        return jsonify({
            "success": False,
            "error": {
                "code": "UNAUTHORIZED",
                "message": err
            }
        }), 401

    return jsonify({
        "success": True,
        "data": res
    })


@auth_bp.route("/api/auth/me", methods=["GET"])
@require_auth
def api_get_current_user():
    """Returns profile for currently authenticated user."""
    return jsonify({
        "success": True,
        "data": g.current_user
    })


@auth_bp.route("/api/auth/register", methods=["POST"])
@require_auth
@require_role(["ADMIN"])
def api_register_user():
    """Admin-only endpoint for creating new user accounts."""
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    email = data.get("email", "").strip()
    role = data.get("role", "OPERATOR").upper()

    if not username or not password:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_INPUT",
                "message": "Username and password are required."
            }
        }), 400

    if role not in ["ADMIN", "OPERATOR", "VIEWER"]:
        return jsonify({
            "success": False,
            "error": {
                "code": "INVALID_INPUT",
                "message": "Role must be one of ADMIN, OPERATOR, VIEWER."
            }
        }), 400

    session = get_db_session()
    try:
        existing = session.query(UserModel).filter_by(username=username).first()
        if existing:
            return jsonify({
                "success": False,
                "error": {
                    "code": "CONFLICT",
                    "message": f"User '{username}' already exists."
                }
            }), 409

        user = UserModel(
            username=username,
            password_hash=hash_password(password),
            email=email,
            role=role
        )
        session.add(user)
        session.commit()

        return jsonify({
            "success": True,
            "data": user.to_dict(),
            "message": f"User '{username}' registered successfully."
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({
            "success": False,
            "error": {
                "code": "SERVER_ERROR",
                "message": str(e)
            }
        }), 500
    finally:
        session.close()
