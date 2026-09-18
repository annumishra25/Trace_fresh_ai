import os
import sys
import unittest

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.sensor_normalizer import normalize_telemetry_payload
from services.sensor_quality_engine import evaluate_sensor_quality
from services.environmental_baseline import EnvironmentalBaselineEngine, calculate_series_stats
from services.exposure_engine import calculate_exposure_metrics
from services.sensor_intelligence_service import SensorIntelligenceService
from ml.sensor_features import extract_sensor_features
from ml.sensor_model import SensorEnvironmentModel

TEST_EVENTS_FILE = os.path.join(os.path.dirname(__file__), "test_events_tmp.json")


class TestSensorIntelligence(unittest.TestCase):
    def setUp(self):
        if os.path.exists(TEST_EVENTS_FILE):
            os.remove(TEST_EVENTS_FILE)
        self.service = SensorIntelligenceService(events_file=TEST_EVENTS_FILE)
        self.model = SensorEnvironmentModel()

    def tearDown(self):
        if os.path.exists(TEST_EVENTS_FILE):
            os.remove(TEST_EVENTS_FILE)

    def test_sensor_normalizer(self):
        raw = {
            "nodeId": "TF-NODE-01",
            "timestamp": "2026-09-05T12:00:00Z",
            "sensors": {
                "temperature": {"value": 26.4},
                "humidity": {"value": 72.1},
                "gas": {"value": 180.0}
            },
            "source": "hardware"
        }
        norm = normalize_telemetry_payload(raw)
        self.assertIsNotNone(norm)
        self.assertEqual(norm["nodeId"], "TF-NODE-01")
        self.assertEqual(norm["temperatureC"], 26.4)
        self.assertEqual(norm["humidityPct"], 72.1)
        self.assertEqual(norm["gasPpm"], 180.0)

    def test_evaluate_sensor_quality(self):
        from datetime import datetime, timezone
        now_iso = datetime.now(timezone.utc).isoformat()
        # Good quality
        good_rec = {"temperatureC": 20.0, "humidityPct": 60.0, "gasPpm": 150.0, "timestamp": now_iso}
        res_good = evaluate_sensor_quality(good_rec)
        self.assertEqual(res_good["status"], "GOOD")
        self.assertGreaterEqual(res_good["qualityScore"], 85)

        # Missing temperature (critical)
        missing_temp = {"humidityPct": 60.0, "timestamp": now_iso}
        res_bad = evaluate_sensor_quality(missing_temp)
        self.assertLess(res_bad["qualityScore"], 80)
        self.assertIn("Critical: Temperature sensor reading missing", res_bad["issues"])

        # Impossible jump
        hist = [
            {"temperatureC": 20.0, "timestamp": now_iso},
            {"temperatureC": 35.0, "timestamp": now_iso}  # 15°C jump in 5s
        ]
        res_jump = evaluate_sensor_quality(hist[1], hist)
        self.assertIn(res_jump["status"], ["DEGRADED", "BAD"])

    def test_environmental_baseline(self):
        series = [10.0, 15.0, 20.0, 25.0, 30.0]
        stats = calculate_series_stats(series)
        self.assertEqual(stats["mean"], 20.0)
        self.assertEqual(stats["median"], 20.0)
        self.assertEqual(stats["min"], 10.0)
        self.assertEqual(stats["max"], 30.0)

    def test_calculate_exposure_metrics(self):
        records = [
            {"temperatureC": 20.0, "humidityPct": 60.0, "gasPpm": 150.0, "timestamp": "2026-09-05T12:00:00Z"},
            {"temperatureC": 28.0, "humidityPct": 80.0, "gasPpm": 300.0, "timestamp": "2026-09-05T12:10:00Z"},  # 10 min exposure
            {"temperatureC": 30.0, "humidityPct": 82.0, "gasPpm": 350.0, "timestamp": "2026-09-05T12:20:00Z"}   # 10 min exposure
        ]
        exp = calculate_exposure_metrics(records)
        temp_exp = exp["temperatureExposure"]
        self.assertGreater(temp_exp["aboveThresholdMinutes"], 0)
        self.assertEqual(temp_exp["excursionCount"], 1)
        self.assertEqual(temp_exp["maxDeviationC"], 5.0)  # 30 - 25 = 5°C

    def test_detect_anomalies(self):
        norm = {
            "nodeId": "TF-NODE-01",
            "timestamp": "2026-09-05T12:00:00Z",
            "temperatureC": 32.5,
            "humidityPct": 85.0,
            "gasPpm": 400.0
        }
        quality = {"qualityScore": 95, "status": "GOOD", "issues": []}
        anomalies = self.service.detect_anomalies(norm, quality)
        
        types = [a["type"] for a in anomalies]
        self.assertIn("HIGH_TEMPERATURE_EXCURSION", types)
        self.assertIn("HIGH_HUMIDITY_SURGE", types)
        self.assertIn("SPOILAGE_GAS_SURGE", types)
        self.assertIn("COMPOUND_THERMAL_HUMIDITY_STRESS", types)

    def test_sensor_features_and_ml_model(self):
        norm = {"temperatureC": 28.0, "humidityPct": 78.0, "gasPpm": 300.0}
        pred = self.model.predict(norm)

        self.assertIn("environmentRisk", pred)
        self.assertGreater(pred["environmentRisk"], 0)
        self.assertEqual(pred["modelMetadata"]["version"], "0.1.0")
        self.assertEqual(pred["modelMetadata"]["type"], "prototype")
        self.assertFalse(pred["modelMetadata"]["validated"])

    def test_multi_node_environmental_isolation(self):
        raw1 = {"nodeId": "TF-NODE-01", "sensors": {"temperature": {"value": 22.0}}}
        raw2 = {"nodeId": "TF-NODE-02", "sensors": {"temperature": {"value": 31.0}}}

        res1 = self.service.process_node_environment(raw1)
        res2 = self.service.process_node_environment(raw2)

        self.assertEqual(res1["nodeId"], "TF-NODE-01")
        self.assertEqual(res2["nodeId"], "TF-NODE-02")
        self.assertLess(res1["environmentRiskScore"], res2["environmentRiskScore"])


if __name__ == "__main__":
    unittest.main()
