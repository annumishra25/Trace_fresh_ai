# TraceFresh-AI Route Engine & GPS Tracking Architecture

## Overview
The TraceFresh-AI Route Engine processes real-time GPS telemetry from smart monitoring nodes (`TF-NODE-01`, `TF-NODE-02`), compares actual traveled tracks against planned routes, calculates perpendicular route deviation, detects stationary delay periods, estimates arrival time deltas, logs route events, and powers the Logistics Intelligence dashboard.

---

## System Architecture

```
          PHYSICAL / SIMULATED NODES
          ┌─────────────────────────┐
          │ TF-NODE-01 / TF-NODE-02 │
          └────────────┬────────────┘
                       │ (GPS Telemetry)
                       ↓
                Flask Backend
                       │
             telemetry_service.py
                       │
                       ↓
             route_engine.py
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
    Distance       Deviation        Delay
   Calculation    Calculation    Estimation
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                route_routes.py
                       │
                       ↓
             React Logistics Page
              (SupplyChainMap)
```

---

## Core Algorithms & Logic

### 1. Geodesic Distance (Haversine Formula)
Calculates great-circle distance between coordinates on Earth ($R = 6371.0$ km):

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2\cdot\operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c$$

### 2. GPS Telemetry Filtering & Outlier Jump Detection
- **Validation**: Checks latitude in $[-90, 90]$, longitude in $[-180, 180]$, rejects `0.0, 0.0` fix points and `NO_FIX` status.
- **Speed Jump Filter**: Flags point as `GPS_OUTLIER` if implied velocity between consecutive points exceeds `MAX_GPS_SPEED_KMH` (150 km/h).

### 3. Route Deviation & Hysteresis State Machine
- Calculates minimum perpendicular distance from current coordinate to planned polyline segment.
- **State Thresholds**:
  - `ON_ROUTE`: Deviation $\le 200$ m
  - `ROUTE_DEVIATION`: $200\text{ m} < \text{Deviation} \le 1000\text{ m}$
  - `OFF_ROUTE`: Deviation $> 1000$ m (requires 3 consecutive readings to trigger `OFF_ROUTE` to prevent GPS noise false alarms)

### 4. Prolonged Stop Detection
- Tracks vehicle speed; if speed drops below `STOP_SPEED_THRESHOLD_KMH` (3 km/h) for $\ge 10$ minutes, marks vehicle as `STOPPED` and logs a `STOP_DELAY` event with duration.

### 5. Delay Analysis & Explainability
- Compares expected vs. estimated arrival time.
- Generates interpretable delay cause (e.g. *"12-minute stationary period detected near Sriperumbudur checkpoint"*).

---

## Configuration Parameters

| Parameter | Default Value | Description |
|---|---|---|
| `MAX_GPS_SPEED_KMH` | `150.0` | Velocity jump outlier threshold |
| `STOP_SPEED_THRESHOLD_KMH` | `3.0` | Maximum speed considered stationary |
| `STOP_DURATION_THRESHOLD_MINUTES` | `10` | Duration required to trigger stop delay event |
| `ROUTE_WARNING_DEVIATION_METERS` | `200.0` | Warning threshold for route deviation |
| `ROUTE_OFF_ROUTE_DEVIATION_METERS` | `1000.0` | Off-route classification threshold |
| `OFF_ROUTE_HYSTERESIS_COUNT` | `3` | Consecutive points required for off-route state |
| `GPS_STALE_TIMEOUT_SECONDS` | `120` | Timeout before flagging GPS signal stale |

---

## REST API Endpoints

- `GET /api/routes`: List all active routes.
- `GET /api/routes/:routeId`: Fetch specific route metadata.
- `GET /api/routes/:routeId/track`: Get historical GPS track points.
- `GET /api/routes/:routeId/status`: Get live progress %, deviation, and delay status.
- `GET /api/routes/:routeId/events`: Get chronological route event timeline.
- `POST /api/routes/:routeId/replay`: Step-by-step trigger for Expo demo route replay.
