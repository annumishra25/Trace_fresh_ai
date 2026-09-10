import requests
import os
from services.telemetry_service import get_latest_telemetry

PI_BACKEND_URL = os.environ.get("PI_BACKEND_URL", "http://127.0.0.1:5000/api/sensors")

DEFAULT_SENSOR_PACKET = {
    "temperature": 5.5,
    "humidity": 71.0,
    "voc": 1.5,
    "co2": 600.0,
    "ethylene": 0.25,
    "weight": 245.0,
    "batch_id": "TF-APL-2026-001",
    "fruit_type": "Apple",
    "node_id": "TF-NODE-01",
    "sensor_status": {
        "dht11": "OK",
        "mq135": "OK"
    },
    "air_quality_status": "GOOD",
    "gas_detected": False,
    "camera_status": "OK",
    "system_status": "ONLINE"
}

def get_latest_sensor_packet():
    # If unconfigured or points to invalid placeholder host, use local telemetry fallback
    if "NEW_IP" in PI_BACKEND_URL or "http://127.0.0.1:5000/api/sensors" in PI_BACKEND_URL:
        latest = get_latest_telemetry("TF-NODE-01")
        if latest and "sensors" in latest:
            sensors = latest.get("sensors", {})
            return {
                "temperature": sensors.get("temperature", {}).get("value", 5.5),
                "humidity": sensors.get("humidity", {}).get("value", 71.0),
                "voc": sensors.get("voc", {}).get("value", 1.5),
                "co2": sensors.get("co2", {}).get("value", 600.0),
                "ethylene": sensors.get("gas", {}).get("value", 0.25),
                "weight": 245.0,
                "batch_id": latest.get("batchId", "TF-APL-2026-001"),
                "fruit_type": "Apple",
                "node_id": latest.get("nodeId", "TF-NODE-01"),
                "sensor_status": {"dht11": "OK", "mq135": "OK"},
                "air_quality_status": "GOOD",
                "gas_detected": False,
                "camera_status": "OK",
                "system_status": "ONLINE"
            }
        return DEFAULT_SENSOR_PACKET

    try:
        response = requests.get(PI_BACKEND_URL, timeout=3)
        if response.ok:
            return response.json()
    except Exception as e:
        print(f"[WARN] Unable to reach hardware Pi at {PI_BACKEND_URL}: {e}")

    return DEFAULT_SENSOR_PACKET