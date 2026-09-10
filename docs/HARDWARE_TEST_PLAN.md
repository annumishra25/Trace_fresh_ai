# TraceFresh Hardware Integration End-to-End Test Plan

This document defines the formal validation test cases for physical smart monitoring node (`TF-NODE-01`) integration with the TraceFresh-AI telemetry pipeline and dashboard.

---

## Test Suite Summary

| Test ID | Test Title | Objective | Expected Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TEST-A** | Power On & Boot | Verify ESP32 microcontroller boot sequence and serial debug log initialization. | Serial prints `Booting TraceFresh Node`, Node ID `TF-NODE-01`, and firmware version `0.1.0`. | **PASS** |
| **TEST-B** | Sensor Initialization | Validate temperature, humidity, and MQ135 sensor readings over serial. | Sensors initialize. Non-nan temperature and humidity values reported over serial. | **PASS** |
| **TEST-C** | GPS Fix & Status | Validate NEO GPS UART module NMEA sentence parsing. | GPS status reports `SEARCHING` or `LOCKED`. Valid latitude/longitude parsed when satellite lock acquired. | **PASS** |
| **TEST-D** | Wi-Fi Connectivity | Verify non-blocking Wi-Fi station mode connection to local access point. | ESP32 connects to configured SSID, prints local IPv4 address, and measures RSSI signal strength. | **PASS** |
| **TEST-E** | Backend HTTP Ingestion | Send physical telemetry POST packet to `/api/telemetry`. | Server returns HTTP 201 Created with generated `telemetryId`. | **PASS** |
| **TEST-F** | Historical Data Store | Verify telemetry payload persistence in `backend/data/telemetry.json`. | Raw telemetry packet is appended with `source: "hardware"`. | **PASS** |
| **TEST-G** | Node State Update | Verify state updates in `backend/data/nodes.json`. | Node `TF-NODE-01` status updates to `ONLINE` with source `hardware`. | **PASS** |
| **TEST-H** | Dashboard UI Display | Inspect Monitoring and Devices pages on React dashboard. | Dashboard displays live sensor values with `DATA SOURCE: HARDWARE` badge. | **PASS** |
| **TEST-I** | Environmental Live Change | Alter temperature/humidity environment around physical sensor. | Dashboard dynamically updates temperature/humidity within 3 seconds. | **PASS** |
| **TEST-J** | Network Disconnection | Disconnect Wi-Fi access point or server network. | MCU does not freeze or crash. Telemetry packets are buffered locally in memory. | **PASS** |
| **TEST-K** | Network Restoration | Reconnect Wi-Fi access point. | ESP32 reconnects automatically and flushes buffered offline telemetry packets to backend. | **PASS** |
| **TEST-L** | Sensor Disconnect & Error Handling | Disconnect a single sensor pin safely. | Disconnected sensor status changes to `MISSING` or `ERROR`. Remaining sensors continue transmitting. MCU does not crash. | **PASS** |

---

## Detailed Test Procedures & Validation Logs

### TEST-A: Power On & Serial Debug Output
```
[INFO] Booting TraceFresh Smart Monitoring Node...
[INFO] Node ID: TF-NODE-01
[INFO] Firmware Version: 0.1.0
[INFO] Hardware Revision: ESP32-REV1
```

### TEST-E & TEST-F: Telemetry Ingestion Response
```json
{
  "success": true,
  "message": "Telemetry accepted",
  "telemetryId": "TEL-20260905-073414-4BB9",
  "nodeId": "TF-NODE-01",
  "serverReceivedAt": "2026-09-05T07:34:14.358579+00:00"
}
```

### TEST-G: Node State Query Response (`GET /api/nodes/TF-NODE-01`)
```json
{
  "nodeId": "TF-NODE-01",
  "name": "TraceFresh Smart Node 01",
  "status": "ONLINE",
  "source": "hardware",
  "batteryPercent": 88,
  "signalStrengthDbm": -59,
  "gpsStatus": "LOCKED"
}
```
