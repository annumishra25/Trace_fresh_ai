import os
import json
import unittest
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from services import telemetry_service, telemetry_validator

class TelemetryPipelineTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

        # Use temporary test files
        self.test_dir = os.path.dirname(os.path.abspath(__file__))
        telemetry_service.TELEMETRY_FILE = os.path.join(self.test_dir, "test_telemetry.json")
        telemetry_service.NODES_FILE = os.path.join(self.test_dir, "test_nodes.json")

        # Initialize clean test files
        with open(telemetry_service.TELEMETRY_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)

        initial_nodes = [
            {
                "nodeId": "TF-NODE-01",
                "name": "TraceFresh Smart Node 01",
                "status": "OFFLINE",
                "assignedBatchId": "TF-APL-2026-001",
                "assignedShipmentId": "SHIP-APL-110",
                "lastSeen": None,
                "lastTelemetryId": None
            },
            {
                "nodeId": "TF-NODE-02",
                "name": "TraceFresh Smart Node 02",
                "status": "OFFLINE",
                "assignedBatchId": "TF-BAN-2026-002",
                "assignedShipmentId": "SHIP-BAN-102",
                "lastSeen": None,
                "lastTelemetryId": None
            }
        ]
        with open(telemetry_service.NODES_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_nodes, f)

    def tearDown(self):
        for filepath in [telemetry_service.TELEMETRY_FILE, telemetry_service.NODES_FILE]:
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception:
                    pass

    def get_valid_payload(self, node_id="TF-NODE-01"):
        return {
            "nodeId": node_id,
            "batchId": "TF-APL-2026-001",
            "shipmentId": "SHIP-APL-110",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sensors": {
                "temperature": {"value": 5.8, "unit": "C", "status": "OK"},
                "humidity": {"value": 71.2, "unit": "%", "status": "OK"},
                "co2": {"value": 612, "unit": "ppm", "status": "OK"},
                "voc": {"value": 1.8, "unit": "ppm", "status": "OK"},
                "gas": {"value": 0.42, "unit": "ppm", "status": "OK"}
            },
            "gps": {
                "latitude": 13.0827,
                "longitude": 80.2707,
                "speedKmh": 32.4,
                "accuracyM": 4.2,
                "status": "LOCKED"
            },
            "device": {
                "batteryPercent": 84,
                "signalStrengthDbm": -61,
                "firmwareVersion": "0.2.0"
            },
            "source": "simulator"
        }

    def test_1_valid_telemetry_accepted(self):
        payload = self.get_valid_payload()
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data["success"])
        self.assertIn("telemetryId", data)
        self.assertTrue(data["telemetryId"].startswith("TEL-"))

    def test_2_missing_node_id_rejected(self):
        payload = self.get_valid_payload()
        del payload["nodeId"]
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertFalse(data["success"])
        self.assertIn("error", data)

    def test_3_invalid_timestamp_rejected(self):
        payload = self.get_valid_payload()
        payload["timestamp"] = "not-a-timestamp"
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_4_invalid_latitude_rejected(self):
        payload = self.get_valid_payload()
        payload["gps"]["latitude"] = 150.0  # Invalid > 90
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_5_invalid_longitude_rejected(self):
        payload = self.get_valid_payload()
        payload["gps"]["longitude"] = -200.0  # Invalid < -180
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_6_invalid_battery_rejected(self):
        payload = self.get_valid_payload()
        payload["device"]["batteryPercent"] = 150  # Invalid > 100
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_7_invalid_sensor_type_rejected(self):
        payload = self.get_valid_payload()
        payload["sensors"]["temperature"]["value"] = "invalid_string_val"
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 400)

    def test_8_nullable_missing_sensor_accepted(self):
        payload = self.get_valid_payload()
        payload["sensors"]["co2"] = {"value": None, "unit": "ppm", "status": "MISSING"}
        response = self.app.post("/api/telemetry", json=payload)
        self.assertEqual(response.status_code, 201)

    def test_9_telemetry_id_generated(self):
        payload = self.get_valid_payload()
        response = self.app.post("/api/telemetry", json=payload)
        data = response.get_json()
        self.assertIn("telemetryId", data)
        self.assertGreater(len(data["telemetryId"]), 10)

    def test_10_server_received_at_generated(self):
        payload = self.get_valid_payload()
        response = self.app.post("/api/telemetry", json=payload)
        data = response.get_json()
        self.assertIn("serverReceivedAt", data)

    def test_11_telemetry_stored_in_history(self):
        payload = self.get_valid_payload()
        self.app.post("/api/telemetry", json=payload)
        with open(telemetry_service.TELEMETRY_FILE, "r", encoding="utf-8") as f:
            records = json.load(f)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["nodeId"], "TF-NODE-01")

    def test_12_node_state_updated(self):
        payload = self.get_valid_payload()
        self.app.post("/api/telemetry", json=payload)
        res = self.app.get("/api/nodes/TF-NODE-01")
        self.assertEqual(res.status_code, 200)
        node_data = res.get_json()["data"]
        self.assertIn(node_data["status"], ["SIMULATED", "ONLINE"])
        self.assertEqual(node_data["batteryPercent"], 84)

    def test_13_latest_telemetry_returned(self):
        payload = self.get_valid_payload()
        self.app.post("/api/telemetry", json=payload)
        res = self.app.get("/api/telemetry/latest/TF-NODE-01")
        self.assertEqual(res.status_code, 200)
        latest = res.get_json()["data"]
        self.assertEqual(latest["nodeId"], "TF-NODE-01")

    def test_14_node_history_returned(self):
        for i in range(5):
            p = self.get_valid_payload()
            p["sensors"]["temperature"]["value"] = 5.0 + i
            self.app.post("/api/telemetry", json=p)

        res = self.app.get("/api/nodes/TF-NODE-01/telemetry?limit=3")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["count"], 3)
        self.assertEqual(len(data["data"]), 3)

    def test_15_batch_telemetry_returned(self):
        payload = self.get_valid_payload()
        self.app.post("/api/telemetry", json=payload)
        res = self.app.get("/api/batches/TF-APL-2026-001/telemetry")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["count"], 1)

    def test_16_unknown_node_handled(self):
        res = self.app.get("/api/nodes/TF-NODE-999")
        self.assertEqual(res.status_code, 404)

    def test_17_stale_node_detection(self):
        past_time = (datetime.now(timezone.utc) - timedelta(seconds=60)).isoformat()
        old_nodes = [
            {
                "nodeId": "TF-NODE-01",
                "status": "ONLINE",
                "lastSeen": past_time,
                "source": "simulator"
            }
        ]
        with open(telemetry_service.NODES_FILE, "w", encoding="utf-8") as f:
            json.dump(old_nodes, f)

        res = self.app.get("/api/nodes/TF-NODE-01")
        self.assertEqual(res.status_code, 200)
        node_data = res.get_json()["data"]
        self.assertEqual(node_data["status"], "STALE")

    def test_18_multiple_nodes_supported(self):
        p1 = self.get_valid_payload("TF-NODE-01")
        p2 = self.get_valid_payload("TF-NODE-02")
        self.app.post("/api/telemetry", json=p1)
        self.app.post("/api/telemetry", json=p2)

        res = self.app.get("/api/nodes")
        self.assertEqual(res.status_code, 200)
        nodes = res.get_json()["data"]
        self.assertEqual(len(nodes), 2)
        node_ids = {n["nodeId"] for n in nodes}
        self.assertIn("TF-NODE-01", node_ids)
        self.assertIn("TF-NODE-02", node_ids)

    def test_19_node_sensors_endpoint(self):
        p = self.get_valid_payload("TF-NODE-01")
        self.app.post("/api/telemetry", json=p)

        res = self.app.get("/api/nodes/TF-NODE-01/sensors")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertEqual(data["nodeId"], "TF-NODE-01")
        self.assertIn("calibrationMetadata", data)
        self.assertIn("sensorAvailability", data)

    def test_20_node_comparison_endpoint(self):
        p1 = self.get_valid_payload("TF-NODE-01")
        p2 = self.get_valid_payload("TF-NODE-02")
        p2["sensors"]["temperature"]["value"] = 8.5
        self.app.post("/api/telemetry", json=p1)
        self.app.post("/api/telemetry", json=p2)

        res = self.app.get("/api/nodes/compare?node1=TF-NODE-01&node2=TF-NODE-02")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertEqual(data["node1"]["nodeId"], "TF-NODE-01")
        self.assertEqual(data["node2"]["nodeId"], "TF-NODE-02")
        self.assertEqual(data["node2"]["latestSensors"]["temperature"]["value"], 8.5)

    def test_21_cross_node_isolation(self):
        p1 = self.get_valid_payload("TF-NODE-01")
        p1["sensors"]["temperature"]["value"] = 5.2
        p2 = self.get_valid_payload("TF-NODE-02")
        p2["sensors"]["temperature"]["value"] = 12.8

        self.app.post("/api/telemetry", json=p1)
        self.app.post("/api/telemetry", json=p2)

        res1 = self.app.get("/api/telemetry/latest/TF-NODE-01")
        res2 = self.app.get("/api/telemetry/latest/TF-NODE-02")

        self.assertEqual(res1.get_json()["data"]["sensors"]["temperature"]["value"], 5.2)
        self.assertEqual(res2.get_json()["data"]["sensors"]["temperature"]["value"], 12.8)

    def test_22_calibration_metadata_presence(self):
        p = self.get_valid_payload("TF-NODE-01")
        self.app.post("/api/telemetry", json=p)
        res = self.app.get("/api/nodes/TF-NODE-01")
        self.assertEqual(res.status_code, 200)
        cal = res.get_json()["data"]["calibrationMetadata"]
        self.assertIn("temperature", cal)
        self.assertIn("status", cal["temperature"])

if __name__ == "__main__":
    unittest.main()
