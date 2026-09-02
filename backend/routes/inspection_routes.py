from flask import Blueprint, jsonify

from services.inspection_service import run_inspection

inspection_bp = Blueprint("inspection_bp", __name__)


@inspection_bp.route("/api/inspect", methods=["POST"])
def inspect():

    try:

        result = run_inspection()

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500