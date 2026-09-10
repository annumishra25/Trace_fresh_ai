import os
import sys
import unittest
from datetime import datetime, timezone

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.route_engine import (
    RouteEngineService,
    haversine_distance_km,
    validate_gps_point,
    is_gps_outlier,
    calculate_min_deviation_meters,
    point_to_segment_distance_meters
)

TEST_ROUTES_FILE = os.path.join(os.path.dirname(__file__), "test_routes_tmp.json")


class TestRouteEngine(unittest.TestCase):
    def setUp(self):
        if os.path.exists(TEST_ROUTES_FILE):
            os.remove(TEST_ROUTES_FILE)
        self.service = RouteEngineService(storage_path=TEST_ROUTES_FILE)

    def tearDown(self):
        if os.path.exists(TEST_ROUTES_FILE):
            os.remove(TEST_ROUTES_FILE)

    def test_haversine_distance(self):
        # Known distance between Chennai (13.0827, 80.2707) and Bengaluru (12.9716, 77.5946) ~ 290 km
        dist = haversine_distance_km(13.0827, 80.2707, 12.9716, 77.5946)
        self.assertGreater(dist, 280.0)
        self.assertLess(dist, 300.0)

    def test_validate_gps_point(self):
        # Valid point
        valid, msg = validate_gps_point({"latitude": 13.0827, "longitude": 80.2707, "status": "LOCKED"})
        self.assertTrue(valid)

        # Invalid lat
        valid, msg = validate_gps_point({"latitude": 95.0, "longitude": 80.2707})
        self.assertFalse(valid)

        # Zero fix
        valid, msg = validate_gps_point({"latitude": 0.0, "longitude": 0.0})
        self.assertFalse(valid)
        self.assertIn("0,0", msg)

        # NO_FIX status
        valid, msg = validate_gps_point({"latitude": 13.0, "longitude": 80.0, "status": "NO_FIX"})
        self.assertFalse(valid)

    def test_is_gps_outlier(self):
        t1 = "2026-09-05T10:00:00Z"
        t2 = "2026-09-05T10:01:00Z"  # 1 minute delta

        p1 = {"latitude": 13.0827, "longitude": 80.2707, "timestamp": t1}
        # Normal movement (1 km in 1 min = 60 km/h)
        p_normal = {"latitude": 13.0900, "longitude": 80.2750, "timestamp": t2}
        self.assertFalse(is_gps_outlier(p1, p_normal))

        # Impossible jump (500 km in 1 min = 30,000 km/h)
        p_outlier = {"latitude": 18.0000, "longitude": 85.0000, "timestamp": t2}
        self.assertTrue(is_gps_outlier(p1, p_outlier))

    def test_calculate_min_deviation_meters(self):
        waypoints = [
            {"latitude": 12.0, "longitude": 78.0},
            {"latitude": 13.0, "longitude": 78.0}
        ]
        # Point on line
        dev_on = calculate_min_deviation_meters(12.5, 78.0, waypoints)
        self.assertLess(dev_on, 10.0)

        # Point 0.01 deg lon away (~1.1 km)
        dev_off = calculate_min_deviation_meters(12.5, 78.01, waypoints)
        self.assertGreater(dev_off, 900.0)

    def test_create_and_get_route(self):
        route_data = {
            "routeId": "ROUTE-TEST-01",
            "shipmentId": "SHIP-TEST-01",
            "nodeId": "TF-NODE-01",
            "origin": {"name": "A", "latitude": 12.0, "longitude": 78.0},
            "destination": {"name": "B", "latitude": 13.0, "longitude": 78.0},
            "waypoints": [
                {"latitude": 12.0, "longitude": 78.0},
                {"latitude": 13.0, "longitude": 78.0}
            ]
        }
        created = self.service.create_route(route_data)
        self.assertEqual(created["routeId"], "ROUTE-TEST-01")

        fetched = self.service.get_route_by_id("ROUTE-TEST-01")
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched["shipmentId"], "SHIP-TEST-01")

    def test_process_gps_point_normal_transit(self):
        route_data = {
            "routeId": "ROUTE-TEST-02",
            "shipmentId": "SHIP-TEST-02",
            "nodeId": "TF-NODE-01",
            "status": "IN_TRANSIT",
            "origin": {"latitude": 12.0, "longitude": 78.0},
            "destination": {"latitude": 13.0, "longitude": 78.0},
            "waypoints": [
                {"latitude": 12.0, "longitude": 78.0},
                {"latitude": 13.0, "longitude": 78.0}
            ]
        }
        self.service.create_route(route_data)

        gps_point = {
            "latitude": 12.5,
            "longitude": 78.0,
            "speedKmh": 55.0,
            "accuracyM": 4.0,
            "timestamp": "2026-09-05T10:00:00Z",
            "status": "LOCKED"
        }
        res = self.service.process_gps_point("TF-NODE-01", gps_point)
        self.assertEqual(res["status"], "ACCEPTED")
        self.assertEqual(res["routeCondition"], "ON_ROUTE")

        route = self.service.get_route_by_id("ROUTE-TEST-02")
        self.assertEqual(len(route["actualTrack"]), 1)
        self.assertGreater(route["actualRoute"]["progressPercent"], 0)

    def test_process_gps_point_route_deviation(self):
        route_data = {
            "routeId": "ROUTE-TEST-03",
            "shipmentId": "SHIP-TEST-03",
            "nodeId": "TF-NODE-01",
            "status": "IN_TRANSIT",
            "origin": {"latitude": 12.0, "longitude": 78.0},
            "destination": {"latitude": 13.0, "longitude": 78.0},
            "waypoints": [
                {"latitude": 12.0, "longitude": 78.0},
                {"latitude": 13.0, "longitude": 78.0}
            ]
        }
        self.service.create_route(route_data)

        # Send point 500m off-route (triggers ROUTE_DEVIATION)
        gps_point = {
            "latitude": 12.5,
            "longitude": 78.005,
            "speedKmh": 45.0,
            "accuracyM": 4.0,
            "timestamp": "2026-09-05T10:00:00Z",
            "status": "LOCKED"
        }
        res = self.service.process_gps_point("TF-NODE-01", gps_point)
        self.assertEqual(res["status"], "ACCEPTED")
        self.assertEqual(res["routeCondition"], "ROUTE_DEVIATION")

    def test_multi_node_route_isolation(self):
        r1 = {
            "routeId": "ROUTE-N1",
            "shipmentId": "SHIP-N1",
            "nodeId": "TF-NODE-01",
            "origin": {"latitude": 12.0, "longitude": 78.0},
            "destination": {"latitude": 13.0, "longitude": 78.0},
            "waypoints": [{"latitude": 12.0, "longitude": 78.0}, {"latitude": 13.0, "longitude": 78.0}]
        }
        r2 = {
            "routeId": "ROUTE-N2",
            "shipmentId": "SHIP-N2",
            "nodeId": "TF-NODE-02",
            "origin": {"latitude": 14.0, "longitude": 79.0},
            "destination": {"latitude": 15.0, "longitude": 79.0},
            "waypoints": [{"latitude": 14.0, "longitude": 79.0}, {"latitude": 15.0, "longitude": 79.0}]
        }
        self.service.create_route(r1)
        self.service.create_route(r2)

        # Ingest for TF-NODE-01
        self.service.process_gps_point("TF-NODE-01", {"latitude": 12.2, "longitude": 78.0, "status": "LOCKED"})
        # Ingest for TF-NODE-02
        self.service.process_gps_point("TF-NODE-02", {"latitude": 14.2, "longitude": 79.0, "status": "LOCKED"})

        fetched1 = self.service.get_route_by_id("ROUTE-N1")
        fetched2 = self.service.get_route_by_id("ROUTE-N2")

        self.assertEqual(len(fetched1["actualTrack"]), 1)
        self.assertEqual(fetched1["actualTrack"][0]["nodeId"], "TF-NODE-01")

        self.assertEqual(len(fetched2["actualTrack"]), 1)
        self.assertEqual(fetched2["actualTrack"][0]["nodeId"], "TF-NODE-02")


if __name__ == "__main__":
    unittest.main()
