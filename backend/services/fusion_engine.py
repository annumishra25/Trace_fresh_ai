import json
import os
import uuid
import threading
from datetime import datetime, timezone

from services.sensor_intelligence_service import SensorIntelligenceService
from services.route_engine import RouteEngineService
from services.inspection_service import get_inspections_by_batch
from services.batch_service import get_batch_by_id
from services.telemetry_service import get_node, get_node_telemetry
from services.fusion_explainability import generate_fusion_explanation

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DECISIONS_FILE = os.path.join(DATA_DIR, "fusion_decisions.json")
EVENTS_FILE = os.path.join(DATA_DIR, "fusion_events.json")

# Configurable prototype component weights
FUSION_WEIGHTS = {
    "sensor": 0.40,
    "route": 0.25,
    "vision": 0.35
}

_file_lock = threading.Lock()


def _ensure_storage_exists():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DECISIONS_FILE):
        with open(DECISIONS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def load_decisions():
    _ensure_storage_exists()
    with _file_lock:
        try:
            with open(DECISIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []


def save_decisions(decisions):
    _ensure_storage_exists()
    with _file_lock:
        with open(DECISIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(decisions, f, indent=2)


def load_fusion_events():
    _ensure_storage_exists()
    with _file_lock:
        try:
            with open(EVENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []


def save_fusion_events(events):
    _ensure_storage_exists()
    with _file_lock:
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(events, f, indent=2)


def calculate_fusion_confidence(image_quality_score=90.0, image_status="GOOD", gps_age_seconds=0.0, sensor_freshness_seconds=0.0):
    applied_penalties = []
    sensor_conf = 0.90
    route_conf = 0.90
    visual_conf = 0.90

    if image_status in ["BLURRY", "POOR"] or image_quality_score < 60:
        visual_conf *= 0.70
        applied_penalties.append({
            "component": "vision",
            "reason": "BLURRY_OR_POOR_IMAGE",
            "multiplier": 0.70,
            "description": f"Image quality score ({image_quality_score}/100) reduced visual confidence"
        })

    if gps_age_seconds > 3600:
        route_conf *= 0.75
        applied_penalties.append({
            "component": "route",
            "reason": "GPS_STALE_OVER_1HR",
            "multiplier": 0.75,
            "description": f"GPS telemetry age ({round(gps_age_seconds/60, 1)} min) reduced location confidence"
        })

    if sensor_freshness_seconds > 1800:
        sensor_conf *= 0.80
        applied_penalties.append({
            "component": "sensor",
            "reason": "SENSOR_STALE",
            "multiplier": 0.80,
            "description": "Environmental sensor telemetry is stale"
        })

    overall_conf = round(
        (sensor_conf * FUSION_WEIGHTS["sensor"]) +
        (route_conf * FUSION_WEIGHTS["route"]) +
        (visual_conf * FUSION_WEIGHTS["vision"]),
        2
    )

    rating = "HIGH" if overall_conf >= 0.80 else "MODERATE" if overall_conf >= 0.60 else "LOW"

    return {
        "overallConfidence": overall_conf,
        "rating": rating,
        "sensorConfidence": round(sensor_conf, 2),
        "routeConfidence": round(route_conf, 2),
        "visualConfidence": round(visual_conf, 2),
        "appliedPenalties": applied_penalties
    }


def calculate_component_risks(sensor_risk_score, route_risk_score, visual_risk_score, confidence_data=None):
    sensor_risk_score = max(0.0, min(100.0, float(sensor_risk_score)))
    route_risk_score = max(0.0, min(100.0, float(route_risk_score)))
    visual_risk_score = max(0.0, min(100.0, float(visual_risk_score)))

    base_weighted = (
        (sensor_risk_score * FUSION_WEIGHTS["sensor"]) +
        (route_risk_score * FUSION_WEIGHTS["route"]) +
        (visual_risk_score * FUSION_WEIGHTS["vision"])
    )

    def get_rating(score):
        if score < 25: return "LOW"
        if score < 55: return "MODERATE"
        if score < 75: return "HIGH"
        return "CRITICAL"

    conf = confidence_data or {}

    return {
        "sensorRisk": {
            "score": round(sensor_risk_score, 1),
            "weight": FUSION_WEIGHTS["sensor"],
            "rating": get_rating(sensor_risk_score),
            "confidence": conf.get("sensorConfidence", 0.90)
        },
        "routeRisk": {
            "score": round(route_risk_score, 1),
            "weight": FUSION_WEIGHTS["route"],
            "rating": get_rating(route_risk_score),
            "confidence": conf.get("routeConfidence", 0.90)
        },
        "visualRisk": {
            "score": round(visual_risk_score, 1),
            "weight": FUSION_WEIGHTS["vision"],
            "rating": get_rating(visual_risk_score),
            "confidence": conf.get("visualConfidence", 0.90)
        },
        "baseWeightedRisk": round(base_weighted, 2)
    }


def calculate_cross_signal_interactions(sensor_risk, route_risk, visual_risk):
    active_rules = []
    combined_multiplier = 1.0

    # Rule A: Temp Excursion + Route Delay
    if sensor_risk >= 35 and route_risk >= 35:
        active_rules.append({
            "rule": "TEMP_EXCURSION_AND_ROUTE_DELAY",
            "multiplier": 1.35,
            "description": "Thermal exposure coincided with transit delay, accelerating decay rate."
        })
        combined_multiplier *= 1.35

    # Rule B: High Humidity + Mold Risk
    if sensor_risk >= 30 and visual_risk >= 50:
        active_rules.append({
            "rule": "HUMIDITY_AND_MOLD_RISK",
            "multiplier": 1.40,
            "description": "High moisture exposure coincided with visual surface anomaly."
        })
        combined_multiplier *= 1.40

    # Rule C: Critical Multi-Excursion
    if sensor_risk >= 60 and route_risk >= 50 and visual_risk >= 50:
        active_rules.append({
            "rule": "CRITICAL_MULTI_EXCURSION",
            "multiplier": 1.50,
            "description": "Severe multi-signal breakdown across sensor, route, and vision inspection."
        })
        combined_multiplier *= 1.50

    return {
        "activeRules": active_rules,
        "combinedMultiplier": round(min(2.0, combined_multiplier), 2)
    }


def resolve_signal_conflicts(sensor_risk, route_risk, visual_risk, base_status):
    conflict_detected = False
    conflict_type = "NONE"
    recommended_status = base_status

    if sensor_risk <= 20 and visual_risk >= 55:
        conflict_detected = True
        conflict_type = "NORMAL_SENSORS_VS_VISUAL_ANOMALY"
        recommended_status = "SIGNAL_CONFLICT"
    elif sensor_risk >= 60 and visual_risk <= 20:
        conflict_detected = True
        conflict_type = "ENVIRONMENTAL_EXCURSION_VS_NORMAL_VISION"
        recommended_status = "SIGNAL_CONFLICT"

    return {
        "conflictDetected": conflict_detected,
        "conflictType": conflict_type,
        "recommendedStatus": recommended_status,
        "resolutionStrategy": "Flag for manual inspector review; elevate status to SIGNAL_CONFLICT for audit."
    }


def estimate_shelf_life(overall_risk_score, produce_type="APPLES"):
    max_days = 10.0 if produce_type.upper() == "APPLES" else 7.0
    risk_factor = max(0.0, min(1.0, float(overall_risk_score) / 100.0))
    remaining = max(0.5, round(max_days * (1.0 - (risk_factor * 0.95)), 1))
    min_days = max(0.2, round(remaining * 0.7, 1))
    max_range = round(remaining * 1.3, 1)

    return {
        "remainingDays": remaining,
        "minDays": min_days,
        "maxDays": max_range,
        "disclaimer": "Engineering decision support estimate. Not guaranteed biological expiration."
    }


def evaluate_multi_modal_fusion(batch_id="TF-APL-2026-001", node_id=None, demo_scenario=None):
    decision_id = f"DEC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    timestamp = datetime.now(timezone.utc).isoformat()

    batch = get_batch_by_id(batch_id) or {}
    commodity = batch.get("fruitType", "APPLES")
    shipment_id = batch.get("traceability", {}).get("shipmentId", "SHIP-APL-110")
    target_node = node_id or batch.get("node", "TF-NODE-01")

    # Defaults for Demo Scenarios
    if demo_scenario == "ALL_GREEN":
        sensor_risk = 10.0
        route_risk = 10.0
        visual_risk = 10.0
        img_qual = 95
        img_stat = "GOOD"
        gps_age = 10
    elif demo_scenario == "TEMP_EXCURSION":
        sensor_risk = 65.0
        route_risk = 55.0
        visual_risk = 15.0
        img_qual = 90
        img_stat = "GOOD"
        gps_age = 10
    elif demo_scenario == "HIGH_HUMIDITY_MOLD":
        sensor_risk = 55.0
        route_risk = 20.0
        visual_risk = 75.0
        img_qual = 90
        img_stat = "GOOD"
        gps_age = 10
    elif demo_scenario == "SIGNAL_CONFLICT_MOLD":
        sensor_risk = 10.0
        route_risk = 10.0
        visual_risk = 70.0
        img_qual = 90
        img_stat = "GOOD"
        gps_age = 10
    elif demo_scenario == "BLURRY_IMAGE_LOW_CONF":
        sensor_risk = 20.0
        route_risk = 15.0
        visual_risk = 60.0
        img_qual = 35
        img_stat = "BLURRY"
        gps_age = 10
    elif demo_scenario == "STALE_GPS_SEVERITY":
        sensor_risk = 30.0
        route_risk = 60.0
        visual_risk = 20.0
        img_qual = 90
        img_stat = "GOOD"
        gps_age = 7200
    elif demo_scenario == "CRITICAL_MULTI_EXCURSION":
        sensor_risk = 85.0
        route_risk = 75.0
        visual_risk = 80.0
        img_qual = 85
        img_stat = "GOOD"
        gps_age = 10
    else:
        # Live evaluation
        sensor_service = SensorIntelligenceService()
        route_service = RouteEngineService()

        history = get_node_telemetry(target_node, limit=50)
        latest_telemetry = history[-1] if history else {}
        sensor_intel = sensor_service.process_node_environment(latest_telemetry, history) if latest_telemetry else {}
        sensor_risk = float(sensor_intel.get("environmentRiskScore", 15)) if sensor_intel else 15.0

        route = route_service.get_route_by_id("ROUTE-001") if target_node == "TF-NODE-01" else route_service.get_route_by_id("ROUTE-002")
        route_status = route.get("routeCondition", "ON_ROUTE") if route else "ON_ROUTE"
        actual_route = route.get("actualRoute", {}) if route else {}
        delay_status = actual_route.get("delayStatus", "ON_TIME")

        route_risk = 0.0
        if route_status == "OFF_ROUTE": route_risk += 60.0
        elif route_status == "ROUTE_DEVIATION": route_risk += 35.0
        if delay_status == "DELAYED": route_risk += 30.0
        elif delay_status == "AT_RISK": route_risk += 15.0

        inspections = get_inspections_by_batch(batch_id)
        if inspections:
            latest_insp = inspections[-1]
            sev = latest_insp.get("severityAssessment", {})
            visual_risk = float(sev.get("visualRiskScore", 10.0))
            img_qual = latest_insp.get("imageQuality", {}).get("qualityScore", 90)
            img_stat = latest_insp.get("imageQuality", {}).get("status", "GOOD")
        else:
            visual_risk = 10.0
            img_qual = 90
            img_stat = "GOOD"

        gps_age = 0.0

    # Calculate Confidence
    confidence_data = calculate_fusion_confidence(
        image_quality_score=img_qual,
        image_status=img_stat,
        gps_age_seconds=gps_age
    )

    # Component Risks
    comp_risks = calculate_component_risks(sensor_risk, route_risk, visual_risk, confidence_data)

    # Cross-Signal Interactions
    interactions = calculate_cross_signal_interactions(sensor_risk, route_risk, visual_risk)

    # Overall Risk Score with Interaction Multiplier
    raw_weighted = comp_risks["baseWeightedRisk"]
    final_risk_score = min(100.0, round(raw_weighted * interactions["combinedMultiplier"], 1))

    # Base Status Classification
    if final_risk_score < 25:
        base_status = "NORMAL"
    elif final_risk_score < 50:
        base_status = "ATTENTION_REQUIRED"
    elif final_risk_score < 75:
        base_status = "WARNING_DISPATCH"
    else:
        base_status = "CRITICAL_ACTION_REQUIRED"

    # Signal Conflict Check
    conflict_data = resolve_signal_conflicts(sensor_risk, route_risk, visual_risk, base_status)
    fusion_status = conflict_data["recommendedStatus"]

    # Freshness Index
    freshness_score = max(0, min(100, int(100 - final_risk_score)))
    freshness_rating = "EXCELLENT" if freshness_score >= 80 else "GOOD" if freshness_score >= 60 else "FAIR" if freshness_score >= 40 else "POOR" if freshness_score >= 20 else "CRITICAL"

    # Shelf Life
    shelf_life = estimate_shelf_life(final_risk_score, commodity)

    # Synthesize Explanation
    explanation = generate_fusion_explanation(
        status=fusion_status,
        overall_risk=final_risk_score,
        component_risks=comp_risks,
        interactions=interactions,
        confidence_data=confidence_data,
        conflict_data=conflict_data,
        produce_type=commodity
    )

    passport_summary = {
        "passportId": f"PASSPORT-{batch_id}",
        "batchId": batch_id,
        "produceType": commodity,
        "originNode": target_node,
        "freshnessIndex": freshness_score,
        "freshnessRating": freshness_rating,
        "conditionStatus": fusion_status,
        "estimatedRemainingDays": shelf_life["remainingDays"],
        "confidence": confidence_data["overallConfidence"],
        "summaryStatement": explanation["summaryText"]
    }

    result = {
        "decisionId": decision_id,
        "batchId": batch_id,
        "nodeId": target_node,
        "demoScenario": demo_scenario,
        "timestamp": timestamp,
        "fusionStatus": fusion_status,
        "overallRiskScore": final_risk_score,
        "freshnessIndex": {
            "score": freshness_score,
            "rating": freshness_rating
        },
        "confidence": confidence_data,
        "componentRisks": comp_risks,
        "crossSignalInteractions": interactions,
        "conflictResolution": conflict_data,
        "estimatedShelfLife": shelf_life,
        "explanation": explanation,
        "confidencePenalties": confidence_data,
        "passportSummary": passport_summary
    }

    # Save to history
    decisions = load_decisions()
    decisions.append(result)
    save_decisions(decisions)

    # Log Event
    events = load_fusion_events()
    events.append({
        "eventId": f"FUS-EVT-{len(events) + 1:04d}",
        "batchId": batch_id,
        "timestamp": timestamp,
        "fusionStatus": fusion_status,
        "overallRiskScore": final_risk_score,
        "freshnessIndex": freshness_score
    })
    save_fusion_events(events)

    return result


def run_fusion_demo(demo_scenario, batch_id="TF-APL-2026-001", node_id="TF-NODE-01"):
    return evaluate_multi_modal_fusion(batch_id=batch_id, node_id=node_id, demo_scenario=demo_scenario)


def get_passport_summary(batch_id="TF-APL-2026-001"):
    res = evaluate_multi_modal_fusion(batch_id=batch_id)
    return res.get("passportSummary", {})


class FusionEngineService:
    def __init__(self):
        _ensure_storage_exists()

    def evaluate_batch_fusion(self, batch_id="TF-APL-2026-001", node_id=None, demo_scenario=None):
        return evaluate_multi_modal_fusion(batch_id=batch_id, node_id=node_id, demo_scenario=demo_scenario)
