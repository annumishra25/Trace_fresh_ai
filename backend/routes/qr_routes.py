from flask import Blueprint, jsonify, request
from services.qr_service import (
    create_qr_identity,
    verify_qr_token,
    deactivate_qr_token,
    get_qr_by_batch,
    load_qr_identities
)
from services.public_passport_service import (
    get_public_consumer_passport,
    get_public_demo_scenario
)
from services.passport_service import generate_digital_product_passport

qr_bp = Blueprint("qr_bp", __name__)


@qr_bp.route("/api/qr/create", methods=["POST"])
def api_create_qr():
    """Creates or replaces a QR identity for a batch."""
    data = request.get_json() or {}
    batch_id = data.get("batchId", "TF-APL-2026-001")
    container_id = data.get("containerId")
    force_new = data.get("forceNew", False)

    record = create_qr_identity(batch_id=batch_id, container_id=container_id, force_new=force_new)
    return jsonify({
        "success": True,
        "data": record
    }), 201


@qr_bp.route("/api/qr/batch/<batch_id>", methods=["GET"])
def api_get_qr_by_batch(batch_id):
    """Retrieves active QR identity for a batch."""
    record = get_qr_by_batch(batch_id)
    if not record:
        record = create_qr_identity(batch_id)

    return jsonify({
        "success": True,
        "data": record
    })


@qr_bp.route("/api/qr/<qr_id>", methods=["GET"])
def api_get_qr_details(qr_id):
    """Retrieves single QR record by qrId or publicToken."""
    qr_list = load_qr_identities()
    for item in qr_list:
        if item.get("qrId") == qr_id or item.get("publicToken") == qr_id:
            return jsonify({
                "success": True,
                "data": item
            })

    return jsonify({
        "success": False,
        "error": f"QR record {qr_id} not found"
    }), 404


@qr_bp.route("/api/qr/verify/<public_token>", methods=["GET"])
def api_verify_qr(public_token):
    """Operator endpoint for verifying a public token."""
    res = get_public_consumer_passport(public_token)
    return jsonify({
        "success": True,
        "data": res
    })


@qr_bp.route("/api/qr/<qr_id>/deactivate", methods=["POST"])
def api_deactivate_qr(qr_id):
    """Deactivates / revokes a QR token."""
    data = request.get_json() or {}
    reason = data.get("reason", "Operator Manual Deactivation")

    record = deactivate_qr_token(qr_id, reason=reason)
    if record:
        return jsonify({
            "success": True,
            "data": record,
            "message": f"QR identity {qr_id} deactivated successfully"
        })

    return jsonify({
        "success": False,
        "error": f"QR identity {qr_id} not found"
    }), 404


@qr_bp.route("/api/public/verify/<public_token>", methods=["GET"])
def api_public_verify(public_token):
    """
    Unauthenticated public verification endpoint.
    Returns sanitized consumer product passport.
    """
    passport = get_public_consumer_passport(public_token)
    return jsonify({
        "success": True,
        "data": passport
    })


@qr_bp.route("/api/public/demo/<scenario_id>", methods=["GET"])
def api_public_demo_scenario(scenario_id):
    """
    Unauthenticated demo endpoint for 8 consumer verification scenarios.
    """
    demo_data = get_public_demo_scenario(scenario_id)
    return jsonify({
        "success": True,
        "data": demo_data
    })
