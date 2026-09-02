import os
from datetime import datetime
from utils.file_utils import load_json, save_json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BATCHES_FILE = os.path.join(BASE_DIR, "data", "batches.json")

# IMPORTANT:
# This must match the frontend address you are using on your laptop / phone.
FRONTEND_BASE_URL = "http://localhost:5173"


def build_passport_url(batch_id):
    return f"{FRONTEND_BASE_URL}/passport/{batch_id}"


def normalize_batch(batch):
    """
    Ensures older/demo batches also get passportUrl automatically
    even if they were created before this field existed.
    """
    if not batch.get("passportUrl") and batch.get("batchId"):
        batch["passportUrl"] = build_passport_url(batch["batchId"])
    return batch


def get_all_batches():
    batches = load_json(BATCHES_FILE, [])
    return [normalize_batch(batch) for batch in batches]


def get_batch_by_id(batch_id):
    batches = get_all_batches()
    for batch in batches:
        if batch.get("batchId") == batch_id:
            return normalize_batch(batch)
    return None


def create_batch(payload):
    batches = get_all_batches()

    batch_id = payload.get("batchId")
    if not batch_id:
        return {"error": "batchId is required"}, 400

    existing = get_batch_by_id(batch_id)
    if existing:
        return {"error": f"Batch {batch_id} already exists"}, 409

    now = datetime.utcnow().isoformat()

    new_batch = {
        "batchId": batch_id,
        "fruitType": payload.get("fruitType", ""),
        "displayName": payload.get("displayName", batch_id),
        "source": payload.get("source", "Unknown Source"),
        "location": payload.get("location", "Unknown Location"),
        "createdAt": now,
        "lastUpdated": now,

        # NEW: permanent passport URL stored in backend record
        "passportUrl": build_passport_url(batch_id),

        "latestAssessment": payload.get("latestAssessment", {
            "visualClass": "",
            "confidence": 0,
            "freshnessScore": 0,
            "shelfLifeDays": 0,
            "spoilageRisk": 0,
            "riskLevel": "UNKNOWN",
            "status": "PENDING",
            "qualityAdvisory": "No assessment yet.",
            "suspiciousQualityFlag": False,
            "reasons": []
        }),
        "latestSensors": payload.get("latestSensors", {
            "temperature": None,
            "humidity": None,
            "mq135": None,
            "storageCondition": "Unknown"
        }),
        "traceability": payload.get("traceability", {
            "lotId": "",
            "packedDate": "",
            "lastScanTime": now,
            "shipmentId": "",
            "node": payload.get("location", "Unknown Node")
        }),
        "history": payload.get("history", [])
    }

    new_batch = normalize_batch(new_batch)

    batches.append(new_batch)
    save_json(BATCHES_FILE, batches)
    return new_batch, 201


def update_batch_scan(batch_id, payload):
    batches = get_all_batches()

    for idx, batch in enumerate(batches):
        if batch.get("batchId") == batch_id:
            now = datetime.utcnow().isoformat()

            latest_assessment = payload.get(
                "latestAssessment",
                batch.get("latestAssessment", {})
            )
            latest_sensors = payload.get(
                "latestSensors",
                batch.get("latestSensors", {})
            )
            traceability = batch.get("traceability", {})

            traceability["lastScanTime"] = now
            if "node" in payload:
                traceability["node"] = payload["node"]

            history = batch.get("history", [])
            history.append({
                "timestamp": now,
                "freshnessScore": latest_assessment.get("freshnessScore"),
                "riskLevel": latest_assessment.get("riskLevel"),
                "status": latest_assessment.get("status")
            })

            batch["latestAssessment"] = latest_assessment
            batch["latestSensors"] = latest_sensors
            batch["traceability"] = traceability
            batch["lastUpdated"] = now

            # IMPORTANT: keep passport URL always present
            batch["passportUrl"] = batch.get("passportUrl") or build_passport_url(batch_id)

            batch["history"] = history

            batch = normalize_batch(batch)
            batches[idx] = batch
            save_json(BATCHES_FILE, batches)
            return batch, 200

    return {"error": f"Batch {batch_id} not found"}, 404