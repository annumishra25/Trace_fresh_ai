from flask import Blueprint, jsonify, request
from services.fusion_engine import (
    FusionEngineService,
    load_decisions,
    load_fusion_events
)

fusion_bp = Blueprint("fusion_bp", __name__)
fusion_service = FusionEngineService()


@fusion_bp.route("/api/fusion/batch/<batch_id>", methods=["GET"])
def get_batch_fusion(batch_id):
    """Retrieve or evaluate unified multi-modal fusion decision for a batch."""
    node_id = request.args.get("nodeId")
    demo_scenario = request.args.get("demoScenario")

    result = fusion_service.evaluate_batch_fusion(
        batch_id=batch_id,
        node_id=node_id,
        demo_scenario=demo_scenario
    )
    return jsonify({
        "status": "success",
        "data": result
    }), 200


@fusion_bp.route("/api/fusion/shipment/<shipment_id>", methods=["GET"])
def get_shipment_fusion(shipment_id):
    """Retrieve fusion decision for a shipment."""
    decisions = load_decisions()
    shipment_decisions = [d for d in decisions if d.get("shipmentId") == shipment_id]
    if not shipment_decisions:
        # Evaluate default batch for shipment
        result = fusion_service.evaluate_batch_fusion(batch_id="TF-APL-2026-001")
        return jsonify({"status": "success", "data": result}), 200

    return jsonify({
        "status": "success",
        "shipmentId": shipment_id,
        "data": shipment_decisions[-1]
    }), 200


@fusion_bp.route("/api/fusion/batch/<batch_id>/explanation", methods=["GET"])
def get_fusion_explanation_endpoint(batch_id):
    """Retrieve explainability summary and operator recommendation for a batch."""
    result = fusion_service.evaluate_batch_fusion(batch_id=batch_id)
    return jsonify({
        "status": "success",
        "batchId": batch_id,
        "data": result.get("explanation", {})
    }), 200


@fusion_bp.route("/api/fusion/batch/<batch_id>/decision-trace", methods=["GET"])
def get_decision_trace(batch_id):
    """Retrieve machine-readable decision trace history for a batch."""
    decisions = load_decisions()
    batch_decisions = [d for d in decisions if d.get("batchId") == batch_id]
    return jsonify({
        "status": "success",
        "batchId": batch_id,
        "count": len(batch_decisions),
        "data": batch_decisions
    }), 200


@fusion_bp.route("/api/fusion/batch/<batch_id>/timeline", methods=["GET"])
def get_fusion_timeline(batch_id):
    """Retrieve correlated multi-modal event timeline for a batch."""
    events = load_fusion_events()
    batch_events = [e for e in events if e.get("batchId") == batch_id]
    return jsonify({
        "status": "success",
        "batchId": batch_id,
        "count": len(batch_events),
        "data": batch_events
    }), 200


@fusion_bp.route("/api/fusion/evaluate", methods=["POST"])
def evaluate_fusion_on_demand():
    """Trigger on-demand multi-modal fusion evaluation."""
    payload = request.get_json() or {}
    batch_id = payload.get("batchId", "TF-APL-2026-001")
    node_id = payload.get("nodeId")
    demo_scenario = payload.get("demoScenario")

    result = fusion_service.evaluate_batch_fusion(
        batch_id=batch_id,
        node_id=node_id,
        demo_scenario=demo_scenario
    )
    return jsonify({
        "status": "success",
        "message": "Fusion Engine evaluation completed",
        "data": result
    }), 200


@fusion_bp.route("/api/fusion/demo", methods=["POST"])
def trigger_demo_fusion():
    """Trigger controlled demo fusion scenario for presentations."""
    payload = request.get_json() or {}
    scenario = payload.get("scenario", "ALL_NORMAL")
    batch_id = payload.get("batchId", "TF-APL-2026-001")
    node_id = payload.get("nodeId", "TF-NODE-01")

    demo_scenario_map = {
        "ALL_NORMAL": "HEALTHY",
        "TEMP_EXCURSION": "HEALTHY",
        "ROUTE_DELAY_TEMP": "HEALTHY",
        "VISUAL_ANOMALY": "MOLD",
        "MULTI_SIGNAL_CONVERGENCE": "MOLD",
        "CONFLICTING_SIGNALS": "MOLD",
        "INSUFFICIENT_DATA": "HEALTHY"
    }
    demo_scen = demo_scenario_map.get(scenario, "HEALTHY")

    result = fusion_service.evaluate_batch_fusion(
        batch_id=batch_id,
        node_id=node_id,
        demo_scenario=demo_scen
    )

    return jsonify({
        "status": "success",
        "message": f"Demo scenario '{scenario}' evaluation completed",
        "data": result
    }), 200
