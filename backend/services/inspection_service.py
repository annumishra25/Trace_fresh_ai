import os
import json
import uuid
import threading
from datetime import datetime, timezone
import requests

from ml.vision_preprocess import validate_image_file, calculate_image_hash
from ml.vision_inference import run_vision_inference
from services.batch_service import update_batch_scan

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
INSPECTIONS_FILE = os.path.join(DATA_DIR, "inspections.json")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "inspections")

PI_CAPTURE_API = os.environ.get("PI_CAPTURE_API", "http://10.87.65.109:5000/api/capture")
_file_lock = threading.Lock()


def _ensure_storage_exists():
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(INSPECTIONS_FILE):
        with open(INSPECTIONS_FILE, "w") as f:
            json.dump([], f, indent=2)


def load_inspections():
    _ensure_storage_exists()
    with _file_lock:
        try:
            with open(INSPECTIONS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []


def save_inspections(inspections):
    _ensure_storage_exists()
    with _file_lock:
        with open(INSPECTIONS_FILE, "w") as f:
            json.dump(inspections, f, indent=2)


def save_uploaded_file(file_storage):
    """Save an uploaded werkzeug FileStorage object safely to server disk."""
    _ensure_storage_exists()
    ext = os.path.splitext(file_storage.filename.lower())[1] or ".jpg"
    filename = f"insp_{uuid.uuid4().hex[:12]}{ext}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    file_storage.save(filepath)
    relative_url = f"/uploads/inspections/{filename}"
    return filepath, relative_url


def run_inspection(file_bytes_or_path=None, batch_id="TF-APL-2026-001", node_id="TF-NODE-01", source="UPLOAD", demo_scenario=None):
    """
    Main Vision AI Inspection Pipeline.
    Supports file uploads, camera capture stream, or demo scenario executions.
    """
    _ensure_storage_exists()
    inspection_id = f"INS-{datetime.now(timezone.utc).strftime('%Y%m%m')}-{uuid.uuid4().hex[:4].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()

    # 1. Demo Scenario Execution
    if demo_scenario:
        inf_result = run_vision_inference(None, demo_scenario=demo_scenario)
        record = {
            "inspectionId": inspection_id,
            "batchId": batch_id,
            "nodeId": node_id,
            "timestamp": timestamp,
            "imagePath": "/uploads/inspections/demo_sample.jpg",
            "imageHash": "demo_hash_12345",
            "source": "DEMO",
            "imageQuality": inf_result["imageQuality"],
            "classification": inf_result["classification"],
            "detections": inf_result["detections"],
            "totalAreaPercent": inf_result["totalAreaPercent"],
            "severityAssessment": inf_result["severityAssessment"],
            "fusionInterface": inf_result["fusionInterface"],
            "recommendation": inf_result["severityAssessment"]["summary"]
        }
        inspections = load_inspections()
        inspections.append(record)
        save_inspections(inspections)
        return record

    # 2. Camera Stream / URL Ingestion (Raspberry Pi fallback)
    if not file_bytes_or_path:
        try:
            print(f"[INFO] Attempting image capture from Raspberry Pi API ({PI_CAPTURE_API})...")
            cap_res = requests.get(PI_CAPTURE_API, timeout=3)
            if cap_res.status_code == 200 and cap_res.json().get("status") == "ok":
                img_url = cap_res.json()["image_url"]
                img_res = requests.get(img_url, timeout=5)
                file_bytes_or_path = img_res.content
                source = "CAMERA"
        except Exception as e:
            print(f"[WARN] Camera capture unavailable ({e}), using default sample image...")
            # Fall back to demo scenario
            return run_inspection(batch_id=batch_id, node_id=node_id, source="DEMO", demo_scenario="HEALTHY")

    # 3. File Validation & Hashing
    is_valid, err_msg, file_size = validate_image_file(file_bytes_or_path)
    if not is_valid:
        return {
            "status": "error",
            "message": f"Image validation failed: {err_msg}",
            "inspectionId": inspection_id
        }

    image_hash = calculate_image_hash(file_bytes_or_path)

    # 4. Save Image locally if bytes passed
    image_url = "/uploads/inspections/default.jpg"
    if isinstance(file_bytes_or_path, bytes):
        filename = f"insp_{uuid.uuid4().hex[:12]}.jpg"
        filepath = os.path.join(UPLOADS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(file_bytes_or_path)
        image_url = f"/uploads/inspections/{filename}"
        target_input = filepath
    else:
        target_input = file_bytes_or_path

    # 5. Run Vision Inference Engine
    inf_result = run_vision_inference(target_input)

    # 6. Update Batch Store
    if batch_id:
        try:
            assessment = {
                "visualClass": inf_result["classification"]["label"],
                "confidence": round(inf_result["classification"]["confidence"] / 100.0, 4),
                "freshnessScore": round(inf_result["classification"]["confidence"], 2),
                "shelfLifeDays": 8,
                "spoilageRisk": round(100.0 - inf_result["classification"]["confidence"], 2),
                "riskLevel": inf_result["severityAssessment"]["overallVisualStatus"],
                "status": "VERIFIED_FRESH" if "fresh" in inf_result["classification"]["label"] else "WARNING",
                "qualityAdvisory": inf_result["severityAssessment"]["summary"],
                "suspiciousQualityFlag": len(inf_result["detections"]) > 0,
                "reasons": [d["explanation"] for d in inf_result["detections"]] if inf_result["detections"] else ["Surface appears healthy"]
            }
            update_batch_scan(batch_id, {"latestAssessment": assessment, "node": node_id})
        except Exception as e:
            print(f"[WARN] Batch update error: {e}")

    record = {
        "inspectionId": inspection_id,
        "batchId": batch_id,
        "nodeId": node_id,
        "timestamp": timestamp,
        "imagePath": image_url,
        "imageHash": image_hash,
        "source": source,
        "imageQuality": inf_result["imageQuality"],
        "classification": inf_result["classification"],
        "detections": inf_result["detections"],
        "totalAreaPercent": inf_result["totalAreaPercent"],
        "severityAssessment": inf_result["severityAssessment"],
        "fusionInterface": inf_result["fusionInterface"],
        "recommendation": inf_result["severityAssessment"]["summary"]
    }

    inspections = load_inspections()
    inspections.append(record)
    save_inspections(inspections)

    return record


def get_inspection_by_id(inspection_id):
    inspections = load_inspections()
    for insp in inspections:
        if insp.get("inspectionId") == inspection_id:
            return insp
    return None


def get_inspections_by_batch(batch_id):
    inspections = load_inspections()
    return [insp for insp in inspections if insp.get("batchId") == batch_id]


def get_inspections_by_node(node_id):
    inspections = load_inspections()
    return [insp for insp in inspections if insp.get("nodeId") == node_id]