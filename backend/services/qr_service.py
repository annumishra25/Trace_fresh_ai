import os
import json
import uuid
import secrets
import threading
from datetime import datetime, timezone

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
QR_FILE = os.path.join(DATA_DIR, "qr_identities.json")
_file_lock = threading.Lock()


def _ensure_storage():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(QR_FILE):
        with open(QR_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def load_qr_identities():
    _ensure_storage()
    with _file_lock:
        try:
            with open(QR_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []


def save_qr_identities(qr_list):
    _ensure_storage()
    with _file_lock:
        with open(QR_FILE, "w", encoding="utf-8") as f:
            json.dump(qr_list, f, indent=2)


def generate_public_token():
    """Generates a secure, non-guessable, 16-character hex public verification token."""
    return f"TR-VER-{secrets.token_hex(8).upper()}"


def build_passport_url(batch_id, frontend_base_url="http://localhost:5173"):
    """Legacy helper for backward compatibility."""
    return f"{frontend_base_url}/passport/{batch_id}"


def generate_qr_payload(public_token, frontend_base_url="http://localhost:5173"):
    """Generates the clean public verification destination URL."""
    return f"{frontend_base_url}/verify/{public_token}"


def create_qr_identity(batch_id, container_id=None, force_new=False):
    """
    Creates or retrieves a unique QR identity for a batch.
    Strictly separates batchId, qrId, and publicToken.
    """
    qr_list = load_qr_identities()
    now_iso = datetime.now(timezone.utc).isoformat()

    # If active QR exists and force_new is False, return existing active record
    if not force_new:
        for item in qr_list:
            if item.get("batchId") == batch_id and item.get("status") == "ACTIVE":
                item["verificationPath"] = f"/verify/{item['publicToken']}"
                item["verificationUrl"] = generate_qr_payload(item["publicToken"])
                return item

    # If force_new, deactivate previous active QRs as REPLACED
    new_qr_id = f"QR-{batch_id}-{uuid.uuid4().hex[:4].upper()}"
    new_public_token = generate_public_token()

    if force_new:
        for item in qr_list:
            if item.get("batchId") == batch_id:
                if item.get("status") == "ACTIVE":
                    item["status"] = "REPLACED"
                item["replacedBy"] = new_qr_id
                item["deactivatedAt"] = now_iso
                item["deactivationReason"] = "Replaced by new QR generation"

    record = {
        "qrId": new_qr_id,
        "batchId": batch_id,
        "containerId": container_id or f"CONT-{batch_id}",
        "publicToken": new_public_token,
        "status": "ACTIVE",
        "createdAt": now_iso,
        "lastScannedAt": None,
        "scanCount": 0,
        "replacedBy": None,
        "deactivationReason": None
    }

    qr_list.append(record)
    save_qr_identities(qr_list)

    record["verificationPath"] = f"/verify/{new_public_token}"
    record["verificationUrl"] = generate_qr_payload(new_public_token)
    return record


def verify_qr_token(public_token):
    """
    Validates a public token and returns token metadata & verification status.
    """
    qr_list = load_qr_identities()
    for item in qr_list:
        if item.get("publicToken") == public_token:
            # Increment scan count
            item["scanCount"] = item.get("scanCount", 0) + 1
            item["lastScannedAt"] = datetime.now(timezone.utc).isoformat()
            save_qr_identities(qr_list)

            status = item.get("status", "ACTIVE")
            return {
                "valid": status == "ACTIVE",
                "status": status,
                "record": item,
                "publicToken": public_token,
                "batchId": item.get("batchId"),
                "deactivationReason": item.get("deactivationReason")
            }

    return {
        "valid": False,
        "status": "NOT_FOUND",
        "record": None,
        "publicToken": public_token,
        "batchId": None,
        "deactivationReason": "Token not found in verification database"
    }


def deactivate_qr_token(qr_id, reason="Operator Manual Deactivation"):
    """
    Deactivates/revokes an active QR token.
    """
    qr_list = load_qr_identities()
    now_iso = datetime.now(timezone.utc).isoformat()
    updated_record = None

    for item in qr_list:
        if item.get("qrId") == qr_id or item.get("publicToken") == qr_id:
            item["status"] = "REVOKED"
            item["deactivatedAt"] = now_iso
            item["deactivationReason"] = reason
            updated_record = item

    if updated_record:
        save_qr_identities(qr_list)
        return updated_record

    return None


def get_qr_by_batch(batch_id):
    """
    Returns active QR record for a given batch.
    """
    qr_list = load_qr_identities()
    for item in qr_list:
        if item.get("batchId") == batch_id and item.get("status") == "ACTIVE":
            item["verificationPath"] = f"/verify/{item['publicToken']}"
            item["verificationUrl"] = generate_qr_payload(item["publicToken"])
            return item
    return None