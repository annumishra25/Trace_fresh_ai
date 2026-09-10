import os
import json
import hashlib
import threading
from datetime import datetime, timezone

from services.batch_service import get_batch_by_id
from services.route_engine import RouteEngineService
from services.sensor_intelligence_service import SensorIntelligenceService
from services.telemetry_service import get_node_telemetry
from services.inspection_service import get_inspections_by_batch
from services.fusion_engine import evaluate_multi_modal_fusion
from services.qr_service import get_qr_by_batch, create_qr_identity

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
PASSPORTS_FILE = os.path.join(DATA_DIR, "passports.json")
_file_lock = threading.Lock()


def _ensure_storage():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(PASSPORTS_FILE):
        with open(PASSPORTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def load_passports():
    _ensure_storage()
    with _file_lock:
        try:
            with open(PASSPORTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []


def save_passports(passports):
    _ensure_storage()
    with _file_lock:
        with open(PASSPORTS_FILE, "w", encoding="utf-8") as f:
            json.dump(passports, f, indent=2)


def calculate_passport_hash(passport_dict):
    """
    Computes a deterministic SHA-256 data integrity hash for the passport structure.
    Detects unexpected modifications or tampering.
    """
    # Create canonical JSON copy excluding dynamic hash itself
    clean_dict = {k: v for k, v in passport_dict.items() if k != "passportHash"}
    serialized = json.dumps(clean_dict, sort_keys=True, default=str)
    return f"sha256:{hashlib.sha256(serialized.encode('utf-8')).hexdigest()}"


def generate_digital_product_passport(batch_id="TF-APL-2026-001", demo_scenario=None):
    """
    Unified Digital Product Passport Generator.
    Aggregates Identity, Journey, Environment, Vision, and Multi-Modal Fusion Engine output.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    passport_id = f"PASS-{batch_id}"

    # 1. Fetch Batch Identity
    batch = get_batch_by_id(batch_id) or {}
    commodity = batch.get("fruitType", "APPLES").upper()
    display_name = batch.get("displayName", f"Premium {commodity.capitalize()}")
    origin = batch.get("source", "Yakima Valley Orchard, WA")
    destination = batch.get("location", "Distribution Center Alpha, Seattle WA")
    shipment_id = batch.get("traceability", {}).get("shipmentId", "SHIP-APL-110")
    target_node = batch.get("node", "TF-NODE-01")

    # 2. Get QR Identity
    qr_record = get_qr_by_batch(batch_id)
    if not qr_record:
        qr_record = create_qr_identity(batch_id)

    # 3. Route Engine Journey
    route_service = RouteEngineService()
    route = route_service.get_route_by_id("ROUTE-001") if target_node == "TF-NODE-01" else route_service.get_route_by_id("ROUTE-002")
    planned_route = route.get("plannedRoute", {}) if route else {}
    actual_route = route.get("actualRoute", {}) if route else {}

    journey = {
        "status": actual_route.get("delayStatus", "COMPLETED"),
        "routeId": route.get("routeId", "ROUTE-001") if route else "ROUTE-001",
        "originName": planned_route.get("origin", {}).get("name", origin),
        "destinationName": planned_route.get("destination", {}).get("name", destination),
        "plannedDistanceKm": planned_route.get("plannedDistanceKm", 185.0),
        "actualDistanceKm": actual_route.get("actualDistanceKm", 185.0),
        "delayMinutes": actual_route.get("delayMinutes", 0),
        "delayReason": actual_route.get("delayReason", "None"),
        "lastCheckpoint": actual_route.get("waypoints", [{}])[-1].get("name", "Seattle Distribution Hub") if actual_route.get("waypoints") else "Seattle Distribution Hub"
    }

    # 4. Environment & Sensor Intelligence
    sensor_service = SensorIntelligenceService()
    history = get_node_telemetry(target_node, limit=50)
    latest_telemetry = history[-1] if history else {}
    sensor_intel = sensor_service.process_node_environment(latest_telemetry, history) if latest_telemetry else {}

    env_metrics = sensor_intel.get("exposureMetrics", {}) if sensor_intel else {}
    temp_exp = env_metrics.get("temperatureExposure", {})
    hum_exp = env_metrics.get("humidityExposure", {})

    environment = {
        "status": "MONITORED",
        "nodeId": target_node,
        "temperatureSummary": {
            "currentTempC": latest_telemetry.get("ambient_temp", 4.2),
            "averageTempC": temp_exp.get("averageTempC", 4.1),
            "maxTempC": temp_exp.get("maxTempC", 5.0),
            "minTempC": temp_exp.get("minTempC", 3.5),
            "excursionMinutes": temp_exp.get("excursionMinutes", 0)
        },
        "humiditySummary": {
            "currentHumidityPercent": latest_telemetry.get("relative_humidity", 88.0),
            "averageHumidityPercent": hum_exp.get("averageHumidityPercent", 87.5),
            "highHumidityMinutes": hum_exp.get("highHumidityMinutes", 0)
        },
        "exposureRiskScore": sensor_intel.get("environmentRiskScore", 12) if sensor_intel else 12,
        "sensorQualityScore": sensor_intel.get("sensorQuality", {}).get("qualityScore", 95) if sensor_intel else 95
    }

    # 5. Vision AI Inspection
    inspections = get_inspections_by_batch(batch_id)
    latest_insp = inspections[-1] if inspections else {}
    sev = latest_insp.get("severityAssessment", {}) if latest_insp else {}
    detections = latest_insp.get("detections", []) if latest_insp else []

    inspection_summary = {
        "inspectionCount": len(inspections),
        "latestVisualStatus": sev.get("overallVisualStatus", "VERIFIED_FRESH"),
        "visualRiskScore": sev.get("visualRiskScore", 10),
        "detectedAnomalies": [d.get("label") for d in detections],
        "imageQualityScore": latest_insp.get("imageQuality", {}).get("qualityScore", 92) if latest_insp else 92,
        "lastInspectedAt": latest_insp.get("timestamp", now_iso)
    }

    # 6. Multi-Modal Fusion Engine Integration
    fusion_result = evaluate_multi_modal_fusion(batch_id=batch_id, node_id=target_node, demo_scenario=demo_scenario)

    condition = {
        "status": fusion_result.get("fusionStatus", "NORMAL"),
        "freshnessIndex": fusion_result.get("freshnessIndex", {}).get("score", 90),
        "freshnessRating": fusion_result.get("freshnessIndex", {}).get("rating", "EXCELLENT"),
        "overallRiskScore": fusion_result.get("overallRiskScore", 10.0),
        "confidence": fusion_result.get("confidence", {}).get("overallConfidence", 0.90),
        "estimatedShelfLifeDays": fusion_result.get("estimatedShelfLife", {}).get("remainingDays", 7.5),
        "actionableRecommendation": fusion_result.get("explanation", {}).get("recommendation", "Condition verified optimal.")
    }

    passport_payload = {
        "passportId": passport_id,
        "passportVersion": "1.0",
        "qrId": qr_record.get("qrId"),
        "publicToken": qr_record.get("publicToken"),
        "issuedAt": now_iso,
        "lastUpdated": now_iso,
        "product": {
            "name": display_name,
            "commodity": commodity,
            "batchId": batch_id,
            "shipmentId": shipment_id
        },
        "origin": origin,
        "destination": destination,
        "journey": journey,
        "environment": environment,
        "inspection": inspection_summary,
        "condition": condition,
        "verification": {
            "verified": True,
            "verificationStatus": "ACTIVE",
            "issuer": "TraceFresh-AI Trust Protocol",
            "lastVerifiedAt": now_iso
        }
    }

    # Compute SHA-256 data integrity hash
    passport_payload["passportHash"] = calculate_passport_hash(passport_payload)

    # Save to passports store
    passports = load_passports()
    # Replace existing or append
    passports = [p for p in passports if p.get("passportId") != passport_id]
    passports.append(passport_payload)
    save_passports(passports)

    return passport_payload


def get_passport_by_id(passport_id):
    passports = load_passports()
    for p in passports:
        if p.get("passportId") == passport_id or p.get("product", {}).get("batchId") == passport_id:
            return p
    return None
