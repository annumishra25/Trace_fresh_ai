from functools import wraps
from flask import request, jsonify, g
from services.auth_service import decode_jwt_token


def require_auth(f):
    """
    Decorator requiring a valid JWT Bearer token in the Authorization header.
    Attaches user payload to flask.g.current_user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Authentication required. Missing Authorization header."
                }
            }), 401

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid Authorization header format. Expected 'Bearer <token>'."
                }
            }), 401

        token = parts[1]
        payload = decode_jwt_token(token)
        if not payload:
            return jsonify({
                "success": False,
                "error": {
                    "code": "UNAUTHORIZED",
                    "message": "Invalid or expired authentication token."
                }
            }), 401

        g.current_user = payload
        return f(*args, **kwargs)

    return decorated


def require_role(allowed_roles):
    """
    Decorator enforcing role-based access control (RBAC).
    Allowed roles: ['ADMIN'], ['OPERATOR'], ['VIEWER']
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, "current_user") or not g.current_user:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Authentication required."
                    }
                }), 401

            user_role = g.current_user.get("role", "VIEWER")
            if user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "FORBIDDEN",
                        "message": f"Permission denied. Role '{user_role}' is not authorized for this resource."
                    }
                }), 403

            return f(*args, **kwargs)
        return decorated
    return decorator
