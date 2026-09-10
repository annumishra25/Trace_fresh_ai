# TraceFresh-AI Data + Telemetry Pipeline Architecture

## 1. Overall Architecture

TraceFresh-AI uses a decoupled, multi-tiered telemetry ingestion and data processing pipeline:

```
[ PHYSICAL / SIMULATED SMART NODES ]
  (TF-NODE-01, TF-NODE-02)
             │
             │ JSON Telemetry over HTTP POST
             ▼
[ FLASK INGESTION ENGINE ]
  (/api/telemetry)
             │
             ├─► [ TELEMETRY VALIDATOR ] (Schema, Data types, GPS & Battery Range Check)
             │
             ├─► [ SERVER TIMESTAMP & ID GENERATOR ] (TEL-YYYYMMDD-HHMMSS-XXXX)
             │
             ├─► [ RAW TELEMETRY STORAGE ] (backend/data/telemetry.json - Append-only)
             │
             └─► [ NODE STATE DERIVATION ] (backend/data/nodes.json - Latest Known State)
                         │
                         ▼
             [ REST TELEMETRY APIs ]
  (/api/nodes, /api/telemetry/latest, /api/nodes/<id>/telemetry)
                         │
                         ▼
             [ REACT TELEMETRY CONTEXT ]
  (Polling / Event Bridge - TelemetryContext)
                         │
                         ▼
             [ LIVE MONITORING DASHBOARD ]
  (Console, Sensor Cards, Historical Recharts, Node Registry)
```

## 2. Telemetry Lifecycle

1. **Generation**: Simulated or physical ESP32 nodes package environmental measurements (temperature, humidity, CO2, VOC, gas), GPS coordinates, battery, and signal strength.
2. **Transmission**: Packet posted to `POST /api/telemetry`.
3. **Validation**: `telemetry_validator.py` checks payload against the canonical schema.
4. **Enrichment**: Backend assigns `telemetryId` and `serverReceivedAt` timestamp.
5. **Storage**: Packet stored in `telemetry.json` as an append-only historical record.
6. **State Update**: Node's latest state, sensor availability, and status (`ONLINE`, `SIMULATED`, `STALE`, `OFFLINE`) updated in `nodes.json`.
7. **Consumption**: Dashboard polls `/api/nodes` and `/api/telemetry/latest` to display live cards and historical trend charts.

## 3. Node Model

Each smart monitoring node tracks:
- `nodeId`: Unique string (e.g. `TF-NODE-01`, `TF-NODE-02`).
- `name`: Human-readable device name.
- `status`: `ONLINE`, `SIMULATED`, `STALE`, `OFFLINE`.
- `assignedBatchId`: Reference to master batch record in `batches.json`.
- `assignedShipmentId`: Associated shipment tracking ID.
- `lastSeen`: Server ISO timestamp when last telemetry arrived.
- `batteryPercent`: 0..100.
- `signalStrengthDbm`: LTE/4G RSSI in dBm.
- `gpsStatus`: `LOCKED`, `SEARCHING`, `LOST`, `UNAVAILABLE`.
- `sensorAvailability`: Map of sensor status (`OK`, `MISSING`, `ERROR`, `STALE`, `CALIBRATING`).

## 4. Sensor Model & Allowed States

Each sensor measurement uses abstract values and explicitly handles connectivity states:
- `OK`: Sensor operating normally with valid numeric reading.
- `MISSING`: Physical sensor disconnected or hardware absent (`value: null`).
- `ERROR`: Sensor hardware error or out-of-bounds reading (`value: null`).
- `STALE`: Data reading unchanged beyond expected sample interval.
- `CALIBRATING`: Sensor undergoing warm-up or calibration cycle.

## 5. Telemetry Schema

```json
{
  "telemetryId": "TEL-20260905-102702-7F2A",
  "nodeId": "TF-NODE-01",
  "batchId": "TF-APL-2026-001",
  "shipmentId": "SHIP-APL-110",
  "timestamp": "2026-09-05T10:27:00+05:30",
  "serverReceivedAt": "2026-09-05T10:27:02+05:30",
  "sensors": {
    "temperature": { "value": 5.8, "unit": "C", "status": "OK" },
    "humidity": { "value": 71.2, "unit": "%", "status": "OK" },
    "co2": { "value": 612, "unit": "ppm", "status": "OK" },
    "voc": { "value": 1.8, "unit": "ppm", "status": "OK" },
    "gas": { "value": 0.42, "unit": "ppm", "status": "OK" }
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
    "firmwareVersion": "0.1.0"
  },
  "source": "simulator"
}
```

## 6. Validation Rules

- `nodeId`: Required non-empty string.
- `timestamp`: Required ISO-8601 string.
- `sensors`: Object containing `temperature`, `humidity`, `co2`, `voc`, `gas`. Values numeric when status is `OK`. Null permitted when `MISSING` or `ERROR`.
- `gps`: `latitude` (-90 to +90), `longitude` (-180 to +180), `speedKmh` (>= 0), `accuracyM` (>= 0).
- `device`: `batteryPercent` (0 to 100), `signalStrengthDbm` (-150 to 0).

## 7. Storage Design

- `backend/data/telemetry.json`: Append-only history file.
- `backend/data/nodes.json`: Node state store updated on telemetry arrival.

## 8. APIs

- `POST /api/telemetry`: Telemetry ingestion endpoint.
- `GET /api/telemetry/latest`: Latest telemetry for nodes.
- `GET /api/nodes`: List registered nodes and health status.
- `GET /api/nodes/<nodeId>/telemetry`: Historical telemetry slice for chart plotting.

## 9. Simulator

CLI simulator located at `backend/simulator/telemetry_simulator.py`. Supports single node, multi-node, time-series random walks, and event scenarios (`temperature_rise`, `humidity_rise`, `gas_rise`, `co2_rise`, `gps_delay`, `battery_drop`).

## 10. Demo Mode vs Live Mode

- **LIVE MODE**: Data streamed directly from backend telemetry API (`/api/nodes` and `/api/telemetry/latest`).
- **DEMO MODE**: Uses fallback baseline batch records from `batches.json` for static offline demonstrations.

## 11. Future Hardware Integration Compatibility

The pipeline separates raw telemetry from master batch data, route calculations, and AI predictions. Physical ESP32 microcontrollers send standard JSON payloads matching the contract to `POST /api/telemetry`, immediately working with all downstream features without UI code changes.
