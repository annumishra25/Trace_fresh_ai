from flask import Blueprint, jsonify, request
from services.telemetry_service import (
    ingest_telemetry,
    get_nodes,
    get_node,
    get_node_sensors,
    compare_nodes,
    get_latest_telemetry,
    get_telemetry_by_id,
    get_node_telemetry,
    get_batch_telemetry
)

telemetry_bp = Blueprint("telemetry_bp", __name__)

@telemetry_bp.route("/api/telemetry", methods=["POST"])
def api_ingest_telemetry():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({
            "success": False,
            "error": "Invalid or missing JSON payload"
        }), 400

    result, status = ingest_telemetry(payload)
    return jsonify(result), status

@telemetry_bp.route("/api/telemetry/latest", methods=["GET"])
def api_get_latest_telemetry():
    data = get_latest_telemetry()
    return jsonify({
        "success": True,
        "data": data
    }), 200

@telemetry_bp.route("/api/telemetry/latest/<node_id>", methods=["GET"])
@telemetry_bp.route("/api/nodes/<node_id>/latest", methods=["GET"])
def api_get_latest_node_telemetry(node_id):
    data = get_latest_telemetry(node_id)
    if not data:
        return jsonify({
            "success": False,
            "message": f"No telemetry found for node {node_id}"
        }), 404
    return jsonify({
        "success": True,
        "data": data
    }), 200

@telemetry_bp.route("/api/telemetry/<telemetry_id>", methods=["GET"])
def api_get_telemetry_by_id(telemetry_id):
    record = get_telemetry_by_id(telemetry_id)
    if not record:
        return jsonify({
            "success": False,
            "message": f"Telemetry record {telemetry_id} not found"
        }), 404
    return jsonify({
        "success": True,
        "data": record
    }), 200

@telemetry_bp.route("/api/nodes", methods=["GET"])
def api_get_nodes():
    nodes = get_nodes()
    return jsonify({
        "success": True,
        "count": len(nodes),
        "data": nodes
    }), 200

@telemetry_bp.route("/api/nodes/compare", methods=["GET"])
def api_compare_nodes():
    node1 = request.args.get("node1", default="TF-NODE-01")
    node2 = request.args.get("node2", default="TF-NODE-02")
    comparison = compare_nodes(node1, node2)
    return jsonify({
        "success": True,
        "data": comparison
    }), 200

@telemetry_bp.route("/api/nodes/<node_id>", methods=["GET"])
def api_get_node(node_id):
    node = get_node(node_id)
    if not node:
        return jsonify({
            "success": False,
            "message": f"Node {node_id} not found"
        }), 404
    return jsonify({
        "success": True,
        "data": node
    }), 200

@telemetry_bp.route("/api/nodes/<node_id>/sensors", methods=["GET"])
def api_get_node_sensors(node_id):
    sensors_info = get_node_sensors(node_id)
    if not sensors_info:
        return jsonify({
            "success": False,
            "message": f"Node {node_id} not found"
        }), 404
    return jsonify({
        "success": True,
        "data": sensors_info
    }), 200

@telemetry_bp.route("/api/nodes/<node_id>/telemetry", methods=["GET"])
def api_get_node_telemetry(node_id):
    limit = request.args.get("limit", default=100, type=int)
    from_time = request.args.get("from", default=None, type=str)
    to_time = request.args.get("to", default=None, type=str)

    node = get_node(node_id)
    if not node:
        return jsonify({
            "success": False,
            "message": f"Node {node_id} not found"
        }), 404

    history = get_node_telemetry(node_id, limit=limit, from_time=from_time, to_time=to_time)
    return jsonify({
        "success": True,
        "nodeId": node_id,
        "count": len(history),
        "data": history
    }), 200

@telemetry_bp.route("/api/batches/<batch_id>/telemetry", methods=["GET"])
def api_get_batch_telemetry(batch_id):
    limit = request.args.get("limit", default=100, type=int)
    from_time = request.args.get("from", default=None, type=str)
    to_time = request.args.get("to", default=None, type=str)

    history = get_batch_telemetry(batch_id, limit=limit, from_time=from_time, to_time=to_time)
    return jsonify({
        "success": True,
        "batchId": batch_id,
        "count": len(history),
        "data": history
    }), 200
