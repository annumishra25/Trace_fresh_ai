# TraceFresh-AI GPS Route Engine Test Plan

## Overview
This test plan documents the verification procedure for Step 4 of the TraceFresh-AI platform, covering GPS quality filtering, distance tracking, route deviation detection, stop detection, delay estimation, multi-node isolation, interactive map rendering, and demo replay functionality.

---

## Test Execution Matrix

| Test Case | Objective | Test Procedure | Expected Result | Status |
|---|---|---|---|---|
| **TC-RT-01** | Haversine Distance Formula | Run distance test between Chennai and Bengaluru | Returns distance between 280 km and 300 km | **PASS** |
| **TC-RT-02** | GPS Coordinate Validation | Pass valid, out-of-range, and `0,0` coordinates to validator | Validates normal coords, rejects `0,0` and out-of-bounds | **PASS** |
| **TC-RT-03** | GPS Outlier Jump Filter | Inject 500 km jump in 1 minute | Flags point as `GPS_OUTLIER` and excludes from track | **PASS** |
| **TC-RT-04** | Route Deviation & Hysteresis | Feed points 500m and 1.8km off planned polyline | Transitions `ON_ROUTE` ➔ `ROUTE_DEVIATION` ➔ `OFF_ROUTE` ➔ `ON_ROUTE` | **PASS** |
| **TC-RT-05** | Prolonged Stop Detection | Feed 3 points with speed <3 km/h over 15 minutes | Marks vehicle `STOPPED` and logs `STOP_DELAY` event | **PASS** |
| **TC-RT-06** | Delay Analysis & Explainability | Compare expected vs estimated arrival time | Calculates delay minutes and generates human-readable reason | **PASS** |
| **TC-RT-07** | Multi-Node Data Isolation | Ingest GPS telemetry from `TF-NODE-01` and `TF-NODE-02` | Tracks remain isolated under assigned shipments | **PASS** |
| **TC-RT-08** | REST API Functionality | Query `/api/routes`, `/api/routes/:id/status`, `/api/routes/:id/events` | Returns 200 OK with accurate JSON schemas | **PASS** |
| **TC-RT-09** | Interactive Map Visualization | Render SupplyChainMap on Logistics page | Displays planned route, actual track, waypoints, vehicle marker | **PASS** |
| **TC-RT-10** | Expo Demo Route Replay Mode | Click `▶ Step Replay` on Logistics page | Advances vehicle position, updates deviation, and logs replay events | **PASS** |

---

## Command to Run Tests
```bash
uv run --with flask --with flask-cors --with requests --with numpy python -m unittest discover -s backend/tests
```
Result: `Ran 30 tests in 2.289s - OK`
