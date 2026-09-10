from flask import Blueprint, jsonify, request
from services.inspection_service import (
    run_inspection,
    get_inspection_by_id,
    get_inspections_by_batch,
    get_inspections_by_node
)

inspection_bp = Blueprint("inspection_bp", __name__)


@inspection_bp.route("/api/inspect", methods=["POST"])
def inspect():
    """
    Main image inspection endpoint.
    Accepts multipart/form-data image upload or JSON payload.
    """
    try:
        batch_id = "TF-APL-2026-001"
        node_id = "TF-NODE-01"
        source = "UPLOAD"
        file_bytes = None
        demo_scenario = None

        if request.content_type and "multipart/form-data" in request.content_type:
            batch_id = request.form.get("batchId", batch_id)
            node_id = request.form.get("nodeId", node_id)
            source = request.form.get("source", source)

            if "image" in request.files:
                file_obj = request.files["image"]
                file_bytes = file_obj.read()

        elif request.is_json:
            payload = request.get_json() or {}
            batch_id = payload.get("batchId", batch_id)
            node_id = payload.get("nodeId", node_id)
            source = payload.get("source", source)
            demo_scenario = payload.get("demoScenario")

        result = run_inspection(
            file_bytes_or_path=file_bytes,
            batch_id=batch_id,
            node_id=node_id,
            source=source,
            demo_scenario=demo_scenario
        )

        return jsonify({
            "status": "success",
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@inspection_bp.route("/api/inspect/<inspection_id>", methods=["GET"])
def get_inspection(inspection_id):
    """Retrieve details for a specific inspection."""
    result = get_inspection_by_id(inspection_id)
    if not result:
        return jsonify({"status": "error", "message": f"Inspection '{inspection_id}' not found"}), 404
    return jsonify({
        "status": "success",
        "data": result
    }), 200


@inspection_bp.route("/api/inspect/batch/<batch_id>", methods=["GET"])
def get_batch_inspections(batch_id):
    """Retrieve inspection history for a batch."""
    history = get_inspections_by_batch(batch_id)
    return jsonify({
        "status": "success",
        "batchId": batch_id,
        "count": len(history),
        "data": history
    }), 200


@inspection_bp.route("/api/inspect/node/<node_id>", methods=["GET"])
def get_node_inspections(node_id):
    """Retrieve inspection history associated with a monitoring node."""
    history = get_inspections_by_node(node_id)
    return jsonify({
        "status": "success",
        "nodeId": node_id,
        "count": len(history),
        "data": history
    }), 200


@inspection_bp.route("/api/inspect/demo", methods=["POST"])
def trigger_demo_inspection():
    """Trigger a controlled demo inspection scenario."""
    payload = request.get_json() or {}
    scenario = payload.get("scenario", "HEALTHY")
    batch_id = payload.get("batchId", "TF-APL-2026-001")
    node_id = payload.get("nodeId", "TF-NODE-01")

    result = run_inspection(
        batch_id=batch_id,
        node_id=node_id,
        source="DEMO",
        demo_scenario=scenario
    )

    return jsonify({
        "status": "success",
        "message": f"Demo scenario '{scenario}' inspection completed",
        "data": result
    }), 200