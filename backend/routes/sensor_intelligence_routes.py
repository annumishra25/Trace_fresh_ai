from flask import Blueprint, jsonify, request
from services.sensor_intelligence_service import SensorIntelligenceService
from services.telemetry_service import get_node, get_node_telemetry
from ml.sensor_model import SensorEnvironmentModel

sensor_intelligence_bp = Blueprint("sensor_intelligence_bp", __name__)
intel_service = SensorIntelligenceService()
sensor_model = SensorEnvironmentModel()


@sensor_intelligence_bp.route("/api/sensors/environment/<node_id>", methods=["GET"])
def get_node_environment(node_id):
    """Retrieve full live environmental intelligence for a node."""
    node = get_node(node_id)
    if not node:
        return jsonify({"status": "error", "message": f"Node '{node_id}' not found"}), 404

    history = get_node_telemetry(node_id, limit=50)
    latest_raw = node.get("latestTelemetry") or (history[-1] if history else {})

    intelligence = intel_service.process_node_environment(latest_raw, history)
    if not intelligence:
        return jsonify({"status": "error", "message": f"No telemetry available for node '{node_id}'"}), 404

    model_pred = sensor_model.predict(
        intelligence["currentTelemetry"],
        intelligence["baselines"],
        intelligence["exposureMetrics"],
        intelligence["sensorQuality"]
    )
    intelligence["modelAssessment"] = model_pred

    return jsonify({
        "status": "success",
        "data": intelligence
    }), 200


@sensor_intelligence_bp.route("/api/sensors/environment/<node_id>/trends", methods=["GET"])
def get_node_trends(node_id):
    """Retrieve rolling trends and rate-of-change statistics for a node."""
    history = get_node_telemetry(node_id, limit=50)
    if not history:
        return jsonify({"status": "error", "message": f"No history for node '{node_id}'"}), 404

    intelligence = intel_service.process_node_environment(history[-1], history)
    return jsonify({
        "status": "success",
        "nodeId": node_id,
        "data": {
            "trends": intelligence["trends"],
            "ratesOfChange": intelligence["baselines"]["ratesOfChange"],
            "baselines": intelligence["baselines"]
        }
    }), 200


@sensor_intelligence_bp.route("/api/sensors/environment/<node_id>/exposure", methods=["GET"])
def get_node_exposure(node_id):
    """Retrieve cumulative exposure breakdown for a node."""
    history = get_node_telemetry(node_id, limit=50)
    if not history:
        return jsonify({"status": "error", "message": f"No history for node '{node_id}'"}), 404

    intelligence = intel_service.process_node_environment(history[-1], history)
    return jsonify({
        "status": "success",
        "nodeId": node_id,
        "data": intelligence["exposureMetrics"]
    }), 200


@sensor_intelligence_bp.route("/api/sensors/environment/<node_id>/anomalies", methods=["GET"])
def get_node_anomalies(node_id):
    """Retrieve detected anomalies for a node."""
    history = get_node_telemetry(node_id, limit=50)
    if not history:
        return jsonify({"status": "error", "message": f"No history for node '{node_id}'"}), 404

    intelligence = intel_service.process_node_environment(history[-1], history)
    return jsonify({
        "status": "success",
        "nodeId": node_id,
        "count": len(intelligence["anomalies"]),
        "data": intelligence["anomalies"]
    }), 200


@sensor_intelligence_bp.route("/api/sensors/environment/<node_id>/quality", methods=["GET"])
def get_node_quality(node_id):
    """Retrieve detailed sensor quality diagnostic report for a node."""
    history = get_node_telemetry(node_id, limit=50)
    if not history:
        return jsonify({"status": "error", "message": f"No history for node '{node_id}'"}), 404

    intelligence = intel_service.process_node_environment(history[-1], history)
    return jsonify({
        "status": "success",
        "nodeId": node_id,
        "data": intelligence["sensorQuality"]
    }), 200


@sensor_intelligence_bp.route("/api/shipments/<shipment_id>/environment", methods=["GET"])
def get_shipment_environment(shipment_id):
    """Retrieve shipment-level environmental risk assessment."""
    all_events = intel_service.load_events()
    shipment_events = [e for e in all_events if e.get("shipmentId") == shipment_id]

    return jsonify({
        "status": "success",
        "shipmentId": shipment_id,
        "eventCount": len(shipment_events),
        "data": shipment_events
    }), 200


@sensor_intelligence_bp.route("/api/shipments/<shipment_id>/environment/timeline", methods=["GET"])
def get_shipment_timeline(shipment_id):
    """Retrieve environmental timeline for a shipment."""
    all_events = intel_service.load_events()
    shipment_events = [e for e in all_events if e.get("shipmentId") == shipment_id]

    return jsonify({
        "status": "success",
        "shipmentId": shipment_id,
        "count": len(shipment_events),
        "data": shipment_events
    }), 200


@sensor_intelligence_bp.route("/api/sensor-model/status", methods=["GET"])
def get_model_status():
    """Retrieve ML sensor model version and metadata status."""
    return jsonify({
        "status": "success",
        "data": sensor_model.metadata
    }), 200
