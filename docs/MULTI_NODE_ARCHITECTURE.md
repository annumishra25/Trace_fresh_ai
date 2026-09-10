# TraceFresh Multi-Node Architecture & Device Health Specification

## 1. Overall System Architecture

TraceFresh-AI supports simultaneous monitoring across multiple physical (`TF-NODE-01`, `TF-NODE-02`) and simulated (`TF-SIM-01`) monitoring nodes attached to different shipment containers or warehouse zones.

```
                           TRACEFRESH CLOUD
                                  │
                           Flask Backend
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
     TF-NODE-01               TF-NODE-02               TF-SIM-01
(Physical Node 01)       (Physical Node 02)       (Simulated Stream)
         │                        │                        │
       ESP32                    ESP32                  Python CLI
         │                        │                        │
  POST /api/telemetry      POST /api/telemetry      POST /api/telemetry
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                                  ▼
                     [ TELEMETRY VALIDATION ]
                                  │
                      [ ISOLATED NODE STATE ]
                 (backend/data/nodes.json Registry)
                                  │
                                  ▼
                   [ REST TELEMETRY API ENGINE ]
       (/api/nodes, /api/nodes/compare, /api/telemetry/latest)
                                  │
                                  ▼
                     [ REACT DASHBOARD CONSOLE ]
       (DeviceHealthCard, NodeComparisonTable, SensorGrid)
```

## 2. Multi-Node Registry & Data Isolation

1. **Independent Telemetry Records**: Every raw telemetry packet saved in `backend/data/telemetry.json` includes `nodeId`. Histories for `TF-NODE-01` and `TF-NODE-02` remain independently queryable without data leakage.
2. **Node State Calculation**:
   - `ONLINE`: Node transmitted valid telemetry within `NODE_STALE_TIMEOUT` (30 seconds).
   - `SIMULATED`: Node active with `"source": "simulator"`.
   - `STALE`: No telemetry received for > 30 seconds.
   - `OFFLINE`: No telemetry received for > 120 seconds or `lastSeen` is null.
   - `ERROR`: All available sensors report `ERROR` status or hardware failure.

## 3. Sensor Health & Calibration Metadata Model

Each node tracks per-sensor status (`OK`, `MISSING`, `ERROR`, `STALE`, `CALIBRATING`, `NO_FIX`) and calibration state:

```json
{
  "nodeId": "TF-NODE-01",
  "name": "TraceFresh Smart Node 01",
  "status": "ONLINE",
  "source": "hardware",
  "firmwareVersion": "0.2.0",
  "lastSeen": "2026-09-05T13:00:00Z",
  "batteryPercent": 88,
  "signalStrengthDbm": -59,
  "sensorsMetadata": ["temperature", "humidity", "co2", "voc", "gas", "gps"],
  "sensorAvailability": {
    "temperature": "OK",
    "humidity": "OK",
    "co2": "MISSING",
    "voc": "OK",
    "gas": "OK",
    "gps": "LOCKED"
  },
  "calibrationMetadata": {
    "temperature": { "status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z" },
    "humidity": { "status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z" },
    "co2": { "status": "REQUIRED", "lastCalibratedAt": null },
    "voc": { "status": "REQUIRED", "lastCalibratedAt": null },
    "gas": { "status": "REQUIRED", "lastCalibratedAt": null },
    "gps": { "status": "CALIBRATED", "lastCalibratedAt": "2026-08-01T00:00:00Z" }
  }
}
```

## 4. Hardware vs Simulator Separation

- **HARDWARE MODE**: Data source labeled as `📡 HARDWARE`. If hardware is offline or disconnected, UI explicitly displays `NO LIVE DATA` / `SENSOR ERROR` without introducing fake numbers.
- **SIMULATOR MODE**: Data source labeled as `SIMULATED`.

## 5. Firmware Configuration & Identity Switch

Flashing Node 01 vs Node 02 is controlled by a single configuration line in `firmware/include/config.h`:
```cpp
// To flash Node 01:
#define NODE_ID "TF-NODE-01"

// To flash Node 02:
#define NODE_ID "TF-NODE-02"
```

All serial prints are tagged with `[TF-NODE-01]` or `[TF-NODE-02]`.
