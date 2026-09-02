from flask import Blueprint, jsonify
from services.sensor_service import get_latest_sensor_packet

sensor_bp = Blueprint("sensor_bp", __name__)


@sensor_bp.route("/api/sensors", methods=["GET"])
def get_sensor_data():
    data = get_latest_sensor_packet()
    return jsonify(data), 200


@sensor_bp.route("/api/sensors/latest", methods=["GET"])
def get_latest_sensor_data():
    data = get_latest_sensor_packet()
    return jsonify({
        "success": True,
        "data": data
    }), 200