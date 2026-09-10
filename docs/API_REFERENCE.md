# TraceFresh-AI Telemetry & Node API Reference

## Ingestion API

### POST /api/telemetry
Ingests a single telemetry payload sent by a smart monitoring node or simulator.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "nodeId": "TF-NODE-01",
  "batchId": "TF-APL-2026-001",
  "shipmentId": "SHIP-APL-110",
  "timestamp": "2026-09-05T10:27:00+05:30",
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

- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Telemetry accepted",
  "telemetryId": "TEL-20260905-102702-7F2A",
  "nodeId": "TF-NODE-01",
  "serverReceivedAt": "2026-09-05T10:27:02.123456+00:00"
}
```

- **Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid telemetry payload",
  "details": [
    "GPS latitude must be between -90 and 90, got 150.0."
  ]
}
```

---

## Node Management APIs

### GET /api/nodes
Returns all registered smart monitoring nodes and their current derived status (`ONLINE`, `SIMULATED`, `STALE`, `OFFLINE`).

- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "nodeId": "TF-NODE-01",
      "name": "TraceFresh Smart Node 01",
      "status": "SIMULATED",
      "assignedBatchId": "TF-APL-2026-001",
      "assignedShipmentId": "SHIP-APL-110",
      "lastSeen": "2026-09-05T10:27:02.123456+00:00",
      "batteryPercent": 84,
      "signalStrengthDbm": -61,
      "gpsStatus": "LOCKED"
    }
  ]
}
```

### GET /api/nodes/<nodeId>
Returns status and latest state for a specific node ID.

---

## Query & History APIs

### GET /api/telemetry/latest
Returns a dictionary of the latest telemetry payload received for each node.

### GET /api/telemetry/latest/<nodeId>
Returns the latest telemetry payload for a specific node ID.

### GET /api/nodes/<nodeId>/telemetry
Returns historical telemetry records for a node.

- **Query Parameters**:
  - `limit` (int, default=100): Maximum records to return.
  - `from` (ISO string): Filter start timestamp.
  - `to` (ISO string): Filter end timestamp.

- **Response (200 OK)**:
```json
{
  "success": true,
  "nodeId": "TF-NODE-01",
  "count": 25,
  "data": [ ... ]
}
```

### GET /api/batches/<batchId>/telemetry
Returns historical telemetry associated with a specific batch ID.
