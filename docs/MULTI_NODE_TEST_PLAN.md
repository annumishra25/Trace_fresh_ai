# TraceFresh Multi-Node Verification & Integration Test Plan

## Test Suite Summary

| Test ID | Scenario Description | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **MN-01** | Dual Node Simultaneous Online | `TF-NODE-01` and `TF-NODE-02` transmit independently. Backend registers both as `ONLINE`. | **PASS** |
| **MN-02** | Node Isolation | Updating temperature on `TF-NODE-01` does not affect `TF-NODE-02` state or charts. | **PASS** |
| **MN-03** | Individual Node Outage | Disconnecting `TF-NODE-01` changes its state to `STALE`/`OFFLINE` while `TF-NODE-02` remains `ONLINE`. | **PASS** |
| **MN-04** | Node Comparison Endpoint | `GET /api/nodes/compare` returns side-by-side metric comparison between nodes. | **PASS** |
| **MN-05** | Sensor Failure Isolation | Single sensor failure on `TF-NODE-01` (e.g. CO2 missing) does not crash node or interrupt other sensors. | **PASS** |
| **MN-06** | GPS No-Fix Handling | Unlocked GPS reports `NO_FIX` status with `latitude: null`, `longitude: null` instead of invalid `0,0`. | **PASS** |
| **MN-07** | Flask Server Restart | Backend restart does not cause firmware to crash. Nodes reconnect and resume transmission. | **PASS** |
| **MN-08** | Simulator + Hardware Coexistence | Simulator running on `TF-NODE-02` coexists with physical hardware on `TF-NODE-01`. | **PASS** |
| **MN-09** | Hardware Mode Integrity | Hardware Mode displays `NO LIVE DATA` / `SENSOR ERROR` when hardware is disconnected (No fake numbers). | **PASS** |
| **MN-10** | Unit Test Execution | All 22 backend unit tests in `backend/tests/test_telemetry.py` pass cleanly. | **PASS** |

---

## Execution Logs

### Node Comparison API (`GET /api/nodes/compare`)
```json
{
  "success": true,
  "data": {
    "node1": { "nodeId": "TF-NODE-01", "status": "ONLINE", "source": "hardware" },
    "node2": { "nodeId": "TF-NODE-02", "status": "SIMULATED", "source": "simulator" },
    "comparedAt": "2026-09-05T13:09:00Z"
  }
}
```

### Serial Log Isolation Verification
```text
[TF-NODE-01][INFO] Temperature: 6.2 C | Telemetry packet sent successfully.
[TF-NODE-02][INFO] Temperature: 4.7 C | Telemetry packet sent successfully.
```
