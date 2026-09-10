import time
import threading
from functools import wraps
from flask import request, jsonify

_request_history = {}
_lock = threading.Lock()


def rate_limit(requests_per_minute=30):
    """
    In-memory rate limiter decorator protecting endpoints against abuse.
    Tracks client IP within a 60-second sliding window.
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            client_ip = request.remote_addr or "127.0.0.1"
            now = time.time()
            window_start = now - 60.0

            with _lock:
                # Clean up old timestamps for this IP
                timestamps = [t for t in _request_history.get(client_ip, []) if t > window_start]
                if len(timestamps) >= requests_per_minute:
                    return jsonify({
                        "success": False,
                        "error": {
                            "code": "TOO_MANY_REQUESTS",
                            "message": f"Rate limit exceeded ({requests_per_minute} requests per minute). Please try again shortly."
                        }
                    }), 429

                timestamps.append(now)
                _request_history[client_ip] = timestamps

            return f(*args, **kwargs)
        return decorated
    return decorator
