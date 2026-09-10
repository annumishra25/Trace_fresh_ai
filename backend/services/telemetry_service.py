import os
import json
import uuid
import threading
from datetime import datetime, timezone
from services.telemetry_validator import validate_telemetry_payload

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
TELEMETRY_FILE = os.path.join(DATA_DIR, "telemetry.json")
NODES_FILE = os.path.join(DATA_DIR, "nodes.json")

# Device Status Configurable Timeouts (in seconds)
NODE_ONLINE_TIMEOUT = 15
NODE_STALE_TIMEOUT = 30
NODE_OFFLINE_TIMEOUT = 120

DEFAULT_STALE_SECONDS = 30
_file_lock = threading.Lock()

def get_stale_threshold_seconds():
    try:
        return int(os.environ.get("TELEMETRY_STALE_SECONDS", DEFAULT_STALE_SECONDS))
    except ValueError:
        return DEFAULT_STALE_SECONDS

def generate_telemetry_id():
    now_str = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    rand_suffix = uuid.uuid4().hex[:4].upper()
    return f"TEL-{now_str}-{rand_suffix}"

def _read_json(filepath, default_value):
    if not os.path.exists(filepath):
        return default_value
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return default_value
            return json.loads(content)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return default_value

def _write_json(filepath, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing {filepath}: {e}")

def calculate_node_status(node):
    last_seen_str = node.get("lastSeen")
    if not last_seen_str:
        return "OFFLINE"

    try:
        clean_ts = last_seen_str.replace("Z", "+00:00")
        last_seen_dt = datetime.fromisoformat(clean_ts)
        if last_seen_dt.tzinfo is None:
            last_seen_dt = last_seen_dt.replace(tzinfo=timezone.utc)
            
        now_dt = datetime.now(timezone.utc)
        diff_seconds = (now_dt - last_seen_dt).total_seconds()
        
        stale_threshold = get_stale_threshold_seconds()
        if diff_seconds > NODE_OFFLINE_TIMEOUT:
            return "OFFLINE"
        elif diff_seconds > stale_threshold:
            return "STALE"
            
        # Check if all available sensors report ERROR
        sensor_availability = node.get("sensorAvailability", {})
        if sensor_availability:
            statuses = list(sensor_availability.values())
            if all(s == "ERROR" for s in statuses):
                return "ERROR"

        source = node.get("source", "simulator")
        if source == "simulator":
            return "SIMULATED"
        return "ONLINE"
    except Exception as e:
        print(f"Error calculating node status: {e}")
        return "OFFLINE"

def get_default_calibration_metadata():
    return {
        "temperature": {"status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z"},
        "humidity": {"status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z"},
        "co2": {"status": "REQUIRED", "lastCalibratedAt": None},
        "voc": {"status": "REQUIRED", "lastCalibratedAt": None},
        "gas": {"status": "REQUIRED", "lastCalibratedAt": None},
        "gps": {"status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z"}
    }

def ingest_telemetry(payload):
    is_valid, errors, normalized = validate_telemetry_payload(payload)
    if not is_valid:
        return {
            "success": False,
            "error": "Invalid telemetry payload",
            "details": errors
        }, 400

    server_received_at = datetime.now(timezone.utc).isoformat()
    telemetry_id = generate_telemetry_id()

    record = dict(normalized)
    record["telemetryId"] = telemetry_id
    record["serverReceivedAt"] = server_received_at

    node_id = record["nodeId"]
    batch_id = record.get("batchId")
    shipment_id = record.get("shipmentId")

    with _file_lock:
        # 1. Save raw telemetry to append-only telemetry.json
        history = _read_json(TELEMETRY_FILE, [])
        history.append(record)
        _write_json(TELEMETRY_FILE, history)

        # 2. Update nodes.json state
        nodes = _read_json(NODES_FILE, [])
        node_map = {n["nodeId"]: n for n in nodes if isinstance(n, dict) and "nodeId" in n}

        existing_node = node_map.get(node_id, {
            "nodeId": node_id,
            "name": f"TraceFresh Smart Node ({node_id})",
            "assignedBatchId": batch_id,
            "assignedShipmentId": shipment_id,
            "sensorsMetadata": ["temperature", "humidity", "co2", "voc", "gas", "gps"],
            "calibrationMetadata": get_default_calibration_metadata()
        })

        if batch_id:
            existing_node["assignedBatchId"] = batch_id
        if shipment_id:
            existing_node["assignedShipmentId"] = shipment_id

        existing_node["lastSeen"] = server_received_at
        existing_node["lastTelemetryId"] = telemetry_id
        existing_node["batteryPercent"] = record.get("device", {}).get("batteryPercent")
        existing_node["signalStrengthDbm"] = record.get("device", {}).get("signalStrengthDbm")
        existing_node["firmwareVersion"] = record.get("device", {}).get("firmwareVersion", "0.1.0")
        existing_node["gpsStatus"] = record.get("gps", {}).get("status", "UNKNOWN")
        existing_node["source"] = record.get("source", "simulator")

        if "sensorsMetadata" not in existing_node:
            existing_node["sensorsMetadata"] = ["temperature", "humidity", "co2", "voc", "gas", "gps"]
        if "calibrationMetadata" not in existing_node:
            existing_node["calibrationMetadata"] = get_default_calibration_metadata()

        # Map sensor availability & latest readings
        sensors_data = record.get("sensors", {})
        sensor_availability = {}
        for s_name, s_obj in sensors_data.items():
            st = s_obj.get("status", "UNKNOWN")
            sensor_availability[s_name] = st

        existing_node["sensorAvailability"] = sensor_availability
        existing_node["latestSensors"] = sensors_data
        existing_node["latestTelemetry"] = record

        existing_node["status"] = calculate_node_status(existing_node)
        node_map[node_id] = existing_node

        updated_nodes_list = list(node_map.values())
        _write_json(NODES_FILE, updated_nodes_list)

    # Process GPS telemetry in Route Engine
    gps_data = record.get("gps")
    if gps_data and isinstance(gps_data, dict):
        try:
            from services.route_engine import RouteEngineService
            route_engine = RouteEngineService()
            gps_payload = dict(gps_data)
            gps_payload["timestamp"] = record.get("timestamp")
            gps_payload["source"] = record.get("source", "simulator")
            route_engine.process_gps_point(node_id, gps_payload)
        except Exception as e:
            print(f"[WARN] Route Engine processing error for node {node_id}: {e}")

    return {
        "success": True,
        "message": "Telemetry accepted",
        "telemetryId": telemetry_id,
        "nodeId": node_id,
        "serverReceivedAt": server_received_at
    }, 201

def get_nodes():
    with _file_lock:
        nodes = _read_json(NODES_FILE, [])
        for node in nodes:
            node["status"] = calculate_node_status(node)
            if "sensorsMetadata" not in node:
                node["sensorsMetadata"] = ["temperature", "humidity", "co2", "voc", "gas", "gps"]
            if "calibrationMetadata" not in node:
                node["calibrationMetadata"] = get_default_calibration_metadata()
        return nodes

def get_node(node_id):
    nodes = get_nodes()
    for node in nodes:
        if node.get("nodeId") == node_id:
            return node
    return None

def get_node_sensors(node_id):
    node = get_node(node_id)
    if not node:
        return None
    return {
        "nodeId": node_id,
        "sensorsMetadata": node.get("sensorsMetadata", []),
        "sensorAvailability": node.get("sensorAvailability", {}),
        "calibrationMetadata": node.get("calibrationMetadata", get_default_calibration_metadata()),
        "latestSensors": node.get("latestSensors", {})
    }

def compare_nodes(node_id1="TF-NODE-01", node_id2="TF-NODE-02"):
    n1 = get_node(node_id1)
    n2 = get_node(node_id2)
    return {
        "node1": n1,
        "node2": n2,
        "comparedAt": datetime.now(timezone.utc).isoformat()
    }

def get_latest_telemetry(node_id=None):
    with _file_lock:
        history = _read_json(TELEMETRY_FILE, [])
        if not history:
            return None if node_id else {}

        if node_id:
            for rec in reversed(history):
                if rec.get("nodeId") == node_id:
                    return rec
            return None
        else:
            latest_map = {}
            for rec in history:
                latest_map[rec.get("nodeId")] = rec
            return latest_map

def get_telemetry_by_id(telemetry_id):
    with _file_lock:
        history = _read_json(TELEMETRY_FILE, [])
        for rec in history:
            if rec.get("telemetryId") == telemetry_id:
                return rec
        return None

def get_node_telemetry(node_id, limit=100, from_time=None, to_time=None):
    with _file_lock:
        history = _read_json(TELEMETRY_FILE, [])
        node_history = [rec for rec in history if rec.get("nodeId") == node_id]

        if from_time:
            node_history = [r for r in node_history if r.get("timestamp", "") >= from_time]
        if to_time:
            node_history = [r for r in node_history if r.get("timestamp", "") <= to_time]

        return node_history[-limit:] if limit > 0 else node_history

def get_batch_telemetry(batch_id, limit=100, from_time=None, to_time=None):
    with _file_lock:
        history = _read_json(TELEMETRY_FILE, [])
        batch_history = [rec for rec in history if rec.get("batchId") == batch_id]

        if from_time:
            batch_history = [r for r in batch_history if r.get("timestamp", "") >= from_time]
        if to_time:
            batch_history = [r for r in batch_history if r.get("timestamp", "") <= to_time]

        return batch_history[-limit:] if limit > 0 else batch_history
