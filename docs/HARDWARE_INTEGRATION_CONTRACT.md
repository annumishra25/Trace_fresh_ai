# TraceFresh Smart Node Firmware & Hardware Integration Contract

## Overview

This contract defines the exact JSON payload format and communication protocol that future physical microcontrollers (e.g. ESP32, Raspberry Pi Pico W, Nordic nRF9160) attached to TraceFresh shipments must implement.

## Communication Protocol

- **Transport**: HTTP POST
- **Endpoint**: `http://<server-ip>:5000/api/telemetry`
- **Content-Type**: `application/json`
- **Recommended Frequency**: Every 2 to 30 seconds (configurable based on battery mode).

## Hardware Payload Contract

Firmware must format outgoing telemetry as follows:

```json
{
  "nodeId": "TF-NODE-01",
  "batchId": "TF-APL-2026-001",
  "shipmentId": "SHIP-APL-110",
  "timestamp": "2026-09-05T10:27:00Z",

  "sensors": {
    "temperature": {
      "value": 5.8,
      "unit": "C",
      "status": "OK"
    },
    "humidity": {
      "value": 71.2,
      "unit": "%",
      "status": "OK"
    },
    "co2": {
      "value": 612,
      "unit": "ppm",
      "status": "OK"
    },
    "voc": {
      "value": 1.8,
      "unit": "ppm",
      "status": "OK"
    },
    "gas": {
      "value": 0.42,
      "unit": "ppm",
      "status": "OK"
    }
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
    "firmwareVersion": "1.0.0"
  },

  "source": "hardware"
}
```

## Sensor Status Handling Guidelines

1. If a sensor module is missing or fails to respond over I2C/SPI:
   Set `"status": "MISSING"` and `"value": null`.
2. If a sensor reading fails CRC or is out of range:
   Set `"status": "ERROR"` and `"value": null`.
3. Do **not** send random fallback numbers for disconnected hardware.
4. Always set `"source": "hardware"` for physical ESP32 devices.
