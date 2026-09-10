# TraceFresh Real Hardware Integration Guide

## 1. Hardware Overview & Subsystem Architecture

The TraceFresh Smart Monitoring Node (`TF-NODE-01` / `TF-NODE-02`) uses an ESP32-WROOM-32 / ESP32-S3 microcontroller to package real-time environmental measurements, GPS tracking, and device diagnostics into normalized JSON telemetry payloads.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TRACEFRESH SMART MONITORING NODE                     │
│                             (TF-NODE-01)                               │
│                                                                        │
│  ┌─────────────────┐   ┌─────────────────┐   ┌──────────────────────┐  │
│  │ Temp / Humidity │   │ MQ135 Air / Gas │   │  SCD41 CO2 (NDIR)    │  │
│  │ (DHT11 / SHT45) │   │ (Analog Input)  │   │  (Optional I2C)      │  │
│  └────────┬────────┘   └────────┬────────┘   └──────────┬───────────┘  │
│           │ GPIO 4              │ GPIO 34 (ADC)         │ I2C (SDA/SCL)│
│           └─────────────────────┼───────────────────────┘              │
│                                 ▼                                      │
│                      ┌──────────────────────┐                          │
│                      │   ESP32-WROOM-32     │                          │
│                      │  (Arduino Framework) │                          │
│                      └──────────┬───────────┘                          │
│                                 │                                      │
│      ┌──────────────────────────┼──────────────────────────┐           │
│      │ UART2 (GPIO 16/17)        │ GPIO 35 (ADC Divider)    │ Wi-Fi 4G  │
│      ▼                          ▼                          ▼           │
│  ┌───────────────┐      ┌───────────────┐          ┌───────────────┐   │
│  │ GPS Module    │      │ Battery Level │          │ Wi-Fi / HTTP  │   │
│  │ (NEO-6M/8M)   │      │ Monitor (2:1) │          │ POST Tx       │   │
│  └───────────────┘      └───────────────┘          └───────┬───────┘   │
└────────────────────────────────────────────────────────────┼───────────┘
                                                             │
                                                             ▼
                                                [ TRACEFRESH FLASK BACKEND ]
                                                (POST /api/telemetry)
```

## 2. Hardware Pinout & Wiring Specifications

| Subsystem / Sensor | Component Model | Interface | ESP32 Pin | Voltage / Power | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32 | MicroUSB / Battery | - | 3.3V / 5V | Dual-core Xtensa 32-bit |
| **Temp & Humidity** | DHT11 / DHT22 | Digital OneWire | GPIO 4 | 3.3V | Requires 10k pull-up |
| **VOC / Air Quality** | MQ135 Gas Sensor | Analog Output | GPIO 34 (ADC1_CH6)| 5V (Heater), 3.3V ADC | Warm-up time: 20 seconds |
| **CO₂ Sensor** | SCD41 NDIR | I2C | SDA 21, SCL 22 | 3.3V | Optional (Returns MISSING if absent) |
| **GPS Module** | NEO-6M / NEO-8M | UART (Serial2) | RX: GPIO 16, TX: GPIO 17 | 3.3V / 5V | Baud: 9600 bps |
| **Battery Monitor** | 100k / 100k Divider | Analog Input | GPIO 35 (ADC1_CH7)| 3.2V - 4.2V (LiPo) | 2:1 Voltage Divider |
| **Status Indicator**| Onboard Blue LED | GPIO Output | GPIO 2 | 3.3V | Flashes on HTTP Transmission |
| **Diagnostic Trigger**| BOOT Pushbutton | GPIO Input | GPIO 0 (Pull-up) | GND on press | Triggers Self-Test Serial Report |

## 3. Communication Protocol & Telemetry Payload

- **Protocol**: HTTP POST
- **Endpoint**: `http://<SERVER_LAN_IP>:5000/api/telemetry`
- **Headers**: `Content-Type: application/json`

### Hardware Telemetry Payload Example
```json
{
  "nodeId": "TF-NODE-01",
  "batchId": null,
  "shipmentId": null,
  "timestamp": "2026-09-05T13:00:00Z",
  "sensors": {
    "temperature": { "value": 6.2, "unit": "C", "status": "OK" },
    "humidity": { "value": 72.5, "unit": "%", "status": "OK" },
    "co2": { "value": null, "unit": "ppm", "status": "MISSING" },
    "voc": { "value": 1.45, "unit": "ppm", "status": "OK" },
    "gas": { "value": 0.38, "unit": "ppm", "status": "OK" }
  },
  "gps": {
    "latitude": 13.0827,
    "longitude": 80.2707,
    "speedKmh": 0.0,
    "accuracyM": 3.5,
    "status": "LOCKED"
  },
  "device": {
    "batteryPercent": 88,
    "signalStrengthDbm": -59,
    "firmwareVersion": "0.1.0"
  },
  "source": "hardware"
}
```

## 4. Firmware Modular Architecture

The firmware is located under `firmware/`:

- `firmware/platformio.ini`: PlatformIO build configurations.
- `firmware/include/config.h`: Hardware pinouts, Wi-Fi credentials, backend URL, sampling intervals, and Node ID.
- `firmware/include/sensors.h`: Structs and status enums (`STATUS_OK`, `STATUS_MISSING`, `STATUS_ERROR`, `STATUS_STALE`, `STATUS_CALIBRATING`).
- `firmware/src/sensors/temp_hum_driver.cpp`: Non-blocking Temperature & Humidity driver.
- `firmware/src/sensors/voc_gas_driver.cpp`: MQ135 analog VOC driver with warm-up calibration state.
- `firmware/src/sensors/co2_driver.cpp`: Abstract CO2 driver.
- `firmware/src/gps/gps_driver.cpp`: TinyGPS++ UART driver parsing NMEA sentences.
- `firmware/src/power/battery_driver.cpp`: Battery voltage divider ADC reader.
- `firmware/src/network/wifi_manager.cpp`: Non-blocking Wi-Fi connector and auto-reconnect logic.
- `firmware/src/network/http_client.cpp`: Bounded HTTP POST sender and buffer flusher.
- `firmware/src/telemetry/telemetry_builder.cpp`: Serializes telemetry payload matching Step 1 JSON contract.
- `firmware/src/telemetry/offline_buffer.cpp`: Circular in-memory buffer holding up to 50 packets during Wi-Fi outages.
- `firmware/src/main.cpp`: Main setup, non-blocking scheduler loop, and self-test trigger.
- `firmware/TraceFresh_Node/TraceFresh_Node.ino`: Arduino IDE compatibility wrapper.

## 5. Calibration & Scientific Measurement Guidelines

1. **Temperature & Humidity**: Calibrated using digital factory coefficients built into DHT/SHT sensor silicon.
2. **MQ135 VOC / Gas Sensor**: Raw ADC values are read over GPIO 34. Estimated ppm readings represent relative ambient volatile organic compounds. Laboratory calibration against standard calibration gas is required before making absolute chemical claims.
3. **Measurement vs Decision**: The physical hardware node reports raw measurements. Quality scores, shelf-life prediction, and safety decisions are executed downstream by the software intelligence layer.

## 6. How to Build & Flash Firmware

### Option A: Using PlatformIO (VS Code / CLI)
```bash
cd firmware
pio run --target upload
pio device monitor -b 115200
```

### Option B: Using Arduino IDE
1. Open `firmware/TraceFresh_Node/TraceFresh_Node.ino`.
2. Select Board: `ESP32 Dev Module`.
3. Install Libraries: `ArduinoJson`, `DHT sensor library`, `TinyGPSPlus`.
4. Edit `firmware/include/config.h` to set your Wi-Fi SSID, Password, and Flask server IP.
5. Click **Upload**.
