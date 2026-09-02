from flask import Blueprint, jsonify, request
from services.batch_service import (
    get_all_batches,
    get_batch_by_id,
    create_batch,
    update_batch_scan
)
from services.assessment_service import assess_batch_quality

batch_bp = Blueprint("batch_bp", __name__)


@batch_bp.route("/api/batches", methods=["GET"])
def api_get_batches():
    batches = get_all_batches()
    return jsonify({
        "success": True,
        "count": len(batches),
        "data": batches
    }), 200


@batch_bp.route("/api/batches/<batch_id>", methods=["GET"])
def api_get_batch(batch_id):
    batch = get_batch_by_id(batch_id)
    if not batch:
        return jsonify({
            "success": False,
            "message": f"Batch {batch_id} not found"
        }), 404

    batch["passportUrl"] = f"http://localhost:5173/passport/{batch_id}"

    return jsonify({
        "success": True,
        "data": batch
    }), 200


@batch_bp.route("/api/batches", methods=["POST"])
def api_create_batch():
    payload = request.get_json() or {}
    result, status = create_batch(payload)

    if status != 201:
        return jsonify({
            "success": False,
            "message": result.get("error", "Failed to create batch")
        }), status

    result["passportUrl"] = f"http://localhost:5173/passport/{result['batchId']}"

    return jsonify({
        "success": True,
        "message": "Batch created successfully",
        "data": result
    }), 201


@batch_bp.route("/api/batches/<batch_id>/scan", methods=["POST"])
def api_update_batch_scan(batch_id):
    payload = request.get_json() or {}
    result, status = update_batch_scan(batch_id, payload)

    if status != 200:
        return jsonify({
            "success": False,
            "message": result.get("error", "Failed to update batch")
        }), status

    result["passportUrl"] = f"http://localhost:5173/passport/{batch_id}"

    return jsonify({
        "success": True,
        "message": "Batch updated successfully",
        "data": result
    }), 200

@batch_bp.route("/api/batches/<batch_id>/ingest", methods=["POST"])
def api_ingest_batch_scan(batch_id):
    batch = get_batch_by_id(batch_id)
    if not batch:
        return jsonify({
            "success": False,
            "message": f"Batch {batch_id} not found"
        }), 404

    payload = request.get_json() or {}

    fruit_type = payload.get("fruitType") or batch.get("fruitType")
    visual_class = payload.get("visualClass") or batch.get("latestAssessment", {}).get("visualClass")
    confidence = payload.get("confidence", batch.get("latestAssessment", {}).get("confidence", 0.9))

    temperature = payload.get("temperature")
    humidity = payload.get("humidity")
    mq135 = payload.get("mq135")

    if temperature is None or humidity is None or mq135 is None:
        return jsonify({
            "success": False,
            "message": "temperature, humidity, and mq135 are required for ingest"
        }), 400

    assessment_payload = {
        "fruitType": fruit_type,
        "visualClass": visual_class,
        "confidence": confidence,
        "temperature": temperature,
        "humidity": humidity,
        "mq135": mq135
    }

    assessed_output = assess_batch_quality(assessment_payload)

    update_payload = {
        "latestAssessment": assessed_output["latestAssessment"],
        "latestSensors": assessed_output["latestSensors"],
        "node": payload.get("node", batch.get("traceability", {}).get("node", batch.get("location")))
    }

    result, status = update_batch_scan(batch_id, update_payload)

    if status != 200:
        return jsonify({
            "success": False,
            "message": result.get("error", "Failed to ingest batch scan")
        }), status

    result["passportUrl"] = f"http://localhost:5173/passport/{batch_id}"

    return jsonify({
        "success": True,
        "message": "Batch ingested and assessed successfully",
        "data": result
    }), 200