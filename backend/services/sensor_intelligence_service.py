import json
import os
import threading
from datetime import datetime, timezone

from services.sensor_normalizer import normalize_telemetry_payload
from services.sensor_quality_engine import evaluate_sensor_quality
from services.environmental_baseline import EnvironmentalBaselineEngine
from services.exposure_engine import calculate_exposure_metrics

EVENTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "environment_events.json")
_file_lock = threading.Lock()


def classify_metric_trend(history, metric_key, threshold_rapid=5.0):
    """
    Classifies recent trend state for a metric.
    Returns: STABLE | RISING | FALLING | RAPID_RISE | RAPID_FALL | RECOVERING
    """
    clean_history = [
        r.get(metric_key) for r in history
        if r and r.get(metric_key) is not None
    ]
    if len(clean_history) < 3:
        return "STABLE"

    recent = clean_history[-5:]
    first = float(recent[0])
    last = float(recent[-1])
    diff = last - first

    if diff > threshold_rapid:
        return "RAPID_RISE"
    elif diff < -threshold_rapid:
        return "RAPID_FALL"
    elif diff > 1.5:
        return "RISING"
    elif diff < -1.5:
        return "FALLING"
    else:
        return "STABLE"


class SensorIntelligenceService:
    def __init__(self, events_file=EVENTS_FILE):
        self.events_file = events_file
        self.baseline_engine = EnvironmentalBaselineEngine()
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        os.makedirs(os.path.dirname(self.events_file), exist_ok=True)
        if not os.path.exists(self.events_file):
            with open(self.events_file, "w") as f:
                json.dump([], f, indent=2)

    def load_events(self):
        with _file_lock:
            try:
                with open(self.events_file, "r") as f:
                    return json.load(f)
            except Exception:
                return []

    def save_events(self, events):
        with _file_lock:
            with open(self.events_file, "w") as f:
                json.dump(events, f, indent=2)

    def detect_anomalies(self, normalized_record, quality_report, history=None):
        """
        Detect single-sensor, multi-sensor, and quality anomalies.
        """
        if not normalized_record:
            return []

        anomalies = []
        node_id = normalized_record.get("nodeId", "TF-NODE-01")
        ts = normalized_record.get("timestamp") or datetime.now(timezone.utc).isoformat()
        t = normalized_record.get("temperatureC")
        h = normalized_record.get("humidityPct")
        g = normalized_record.get("gasPpm") or normalized_record.get("vocIndex")
        c = normalized_record.get("co2Ppm")

        # 1. Quality Anomaly
        if quality_report.get("status") in ["BAD", "DEGRADED"]:
            anomalies.append({
                "type": "SENSOR_QUALITY_DEGRADED",
                "severity": "HIGH" if quality_report.get("status") == "BAD" else "MEDIUM",
                "timestamp": ts,
                "nodeId": node_id,
                "metric": "sensorQuality",
                "observedValue": quality_report.get("qualityScore"),
                "expectedRange": {"min": 85, "max": 100},
                "reason": f"Sensor quality degraded: {', '.join(quality_report.get('issues', []))}",
                "confidence": quality_report.get("confidence", 0.8)
            })

        # 2. Temperature Anomalies
        if t is not None:
            if t > 30.0:
                anomalies.append({
                    "type": "HIGH_TEMPERATURE_EXCURSION",
                    "severity": "CRITICAL" if t > 34.0 else "HIGH",
                    "timestamp": ts,
                    "nodeId": node_id,
                    "metric": "temperatureC",
                    "observedValue": t,
                    "expectedRange": {"min": 10.0, "max": 25.0},
                    "reason": f"Cargo temperature ({t}°C) exceeds maximum safe threshold (25.0°C)",
                    "confidence": 0.95
                })
            elif t < 8.0:
                anomalies.append({
                    "type": "FREEZING_TEMPERATURE_RISK",
                    "severity": "HIGH",
                    "timestamp": ts,
                    "nodeId": node_id,
                    "metric": "temperatureC",
                    "observedValue": t,
                    "expectedRange": {"min": 10.0, "max": 25.0},
                    "reason": f"Cargo temperature ({t}°C) dropped below minimum safe threshold (10.0°C)",
                    "confidence": 0.92
                })

        # 3. Humidity Anomalies
        if h is not None:
            if h > 82.0:
                anomalies.append({
                    "type": "HIGH_HUMIDITY_SURGE",
                    "severity": "HIGH" if h > 90.0 else "MEDIUM",
                    "timestamp": ts,
                    "nodeId": node_id,
                    "metric": "humidityPct",
                    "observedValue": h,
                    "expectedRange": {"min": 45.0, "max": 75.0},
                    "reason": f"Cargo humidity ({h}%) exceeds optimal storage range (75%)",
                    "confidence": 0.90
                })

        # 4. Gas / VOC Anomalies
        if g is not None and float(g) > 350.0:
            anomalies.append({
                "type": "SPOILAGE_GAS_SURGE",
                "severity": "CRITICAL" if float(g) > 500.0 else "HIGH",
                "timestamp": ts,
                "nodeId": node_id,
                "metric": "gasPpm",
                "observedValue": g,
                "expectedRange": {"min": 0, "max": 250.0},
                "reason": f"Gas / VOC concentration ({g} ppm) indicates active spoilage or ripening stress",
                "confidence": 0.91
            })

        # 5. Combined Multi-Sensor Anomaly
        if t is not None and h is not None and t > 28.0 and h > 78.0:
            anomalies.append({
                "type": "COMPOUND_THERMAL_HUMIDITY_STRESS",
                "severity": "CRITICAL",
                "timestamp": ts,
                "nodeId": node_id,
                "metric": "compound",
                "observedValue": f"T: {t}°C, H: {h}%",
                "expectedRange": {"tempMax": 25.0, "humMax": 75.0},
                "reason": "Simultaneous high temperature and humidity drastically accelerate microbial growth and mold risk",
                "confidence": 0.96
            })

        return anomalies

    def process_node_environment(self, raw_telemetry, node_history=None):
        """
        Main pipeline processing for node environmental telemetry.
        """
        normalized = normalize_telemetry_payload(raw_telemetry)
        if not normalized:
            return None

        history = node_history or []
        history.append(normalized)

        # 1. Quality evaluation
        quality_report = evaluate_sensor_quality(normalized, history)

        # 2. Baseline statistics
        baselines = self.baseline_engine.compute_baseline(history)

        # 3. Exposure metrics
        exposure_metrics = calculate_exposure_metrics(history)

        # 4. Anomalies
        anomalies = self.detect_anomalies(normalized, quality_report, history)

        # 5. Trend state classification
        trends = {
            "temperature": classify_metric_trend(history, "temperatureC", threshold_rapid=3.0),
            "humidity": classify_metric_trend(history, "humidityPct", threshold_rapid=5.0),
            "gas": classify_metric_trend(history, "gasPpm", threshold_rapid=50.0)
        }

        # 6. Environmental Status & Risk Score Calculation
        risk_score = 0
        risk_factors = []

        if normalized.get("temperatureC") is not None and normalized["temperatureC"] > 25.0:
            dev = normalized["temperatureC"] - 25.0
            add_risk = min(40, int(dev * 5.0))
            risk_score += add_risk
            risk_factors.append(f"Temperature {normalized['temperatureC']}°C (+{dev:.1f}°C above 25°C threshold)")

        if normalized.get("humidityPct") is not None and normalized["humidityPct"] > 75.0:
            dev = normalized["humidityPct"] - 75.0
            add_risk = min(30, int(dev * 2.0))
            risk_score += add_risk
            risk_factors.append(f"Humidity {normalized['humidityPct']}% (+{dev:.1f}% above 75% threshold)")

        if normalized.get("gasPpm") is not None and normalized["gasPpm"] > 250.0:
            dev = normalized["gasPpm"] - 250.0
            add_risk = min(30, int(dev * 0.1))
            risk_score += add_risk
            risk_factors.append(f"Elevated spoilage gas signal ({normalized['gasPpm']} ppm)")

        if quality_report["qualityScore"] < 80:
            risk_score += 10
            risk_factors.append(f"Sensor quality degraded ({quality_report['qualityScore']}%)")

        risk_score = max(0, min(100, risk_score))

        if risk_score >= 60:
            env_status = "CRITICAL_RISK"
        elif risk_score >= 35:
            env_status = "SUBOPTIMAL"
        elif risk_score >= 15:
            env_status = "MONITOR"
        else:
            env_status = "OPTIMAL"

        # Log new events if anomalies detected
        if anomalies:
            all_events = self.load_events()
            for a in anomalies:
                evt_id = f"ENV-{len(all_events) + 1:04d}"
                all_events.append({
                    "id": evt_id,
                    "nodeId": normalized["nodeId"],
                    "shipmentId": normalized["shipmentId"],
                    "eventType": a["type"],
                    "severity": a["severity"],
                    "timestamp": a["timestamp"],
                    "metric": a["metric"],
                    "observedValue": a["observedValue"],
                    "reason": a["reason"],
                    "confidence": a["confidence"]
                })
            self.save_events(all_events)

        return {
            "nodeId": normalized["nodeId"],
            "shipmentId": normalized["shipmentId"],
            "timestamp": normalized["timestamp"],
            "environmentRiskScore": risk_score,
            "environmentStatus": env_status,
            "riskFactors": risk_factors if risk_factors else ["Environmental conditions are within optimal bounds"],
            "currentTelemetry": normalized,
            "sensorQuality": quality_report,
            "exposureMetrics": exposure_metrics,
            "baselines": baselines,
            "trends": trends,
            "anomalies": anomalies
        }
