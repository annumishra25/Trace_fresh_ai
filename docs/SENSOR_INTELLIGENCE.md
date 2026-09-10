# TraceFresh-AI Sensor ML & Environmental Exposure Intelligence

## Overview
Step 5 introduces the **Sensor ML & Environmental Exposure Intelligence** layer to TraceFresh-AI. This system converts raw environmental telemetry from physical nodes (`TF-NODE-01`, `TF-NODE-02`) and simulated streams into normalized metrics, signal quality diagnostics, rolling statistical baselines, cumulative exposure tracking, multi-sensor anomaly detection, and transparent ML risk inference.

---

## Architecture & Data Flow

```
          PHYSICAL SENSORS / HARDWARE NODES
          ┌─────────────────────────────────┐
          │     TF-NODE-01 / TF-NODE-02     │
          └────────────────┬────────────────┘
                           │ (Raw Telemetry)
                           ↓
                     Flask Backend
                           │
                 sensor_normalizer.py
                           │
                 sensor_quality_engine.py
                           │
                environmental_baseline.py
                           │
                    exposure_engine.py
                           │
              sensor_intelligence_service.py
                           │
                   ml/sensor_model.py
                           │
             sensor_intelligence_routes.py
                           │
                           ↓
                 React Dashboard Console
            (EnvironmentalExposureCard.jsx)
```

---

## Core Components

### 1. Sensor Normalization Layer (`sensor_normalizer.py`)
Normalizes all incoming telemetry payloads into explicit, uniform units:
- **Temperature**: °C (range $[-40, 85]$)
- **Humidity**: % (range $[0, 100]$)
- **CO2**: ppm (optional, reported as `null` if not physically installed)
- **Gas / VOC**: ppm / MQ135 ADC index
- **Battery**: %
- **Timestamp**: ISO-8601 UTC

### 2. Sensor Quality Engine (`sensor_quality_engine.py`)
Evaluates signal health and data integrity:
- **Missing Sensor Detection**: Distinguishes critical missing sensors (Temperature/Humidity) from optional sensors (CO2/VOC).
- **Out-of-Range Bounds**: Flags physically implausible values ($T < -20^\circ\text{C}$ or $> 65^\circ\text{C}$).
- **Rate of Change Spikes**: Detects impossible step jumps ($>12^\circ\text{C}$ in 5 seconds).
- **Stuck Sensors**: Detects 5 consecutive identical readings.
- **Staleness**: Flags telemetry older than 45s (warning) or 120s (stale).
- **Outputs**: `qualityScore` (0-100), `status` (`GOOD`, `DEGRADED`, `BAD`, `OFFLINE`), `issues`, `confidence`.

### 3. Environmental Baseline Engine (`environmental_baseline.py`)
Calculates rolling statistical baselines over configurable windows:
- Mean, Median, Min, Max, Standard Deviation, and Rate of Change per hour ($^\circ\text{C/hr}$, $\%/\text{hr}$, $\text{ppm/hr}$).

### 4. Exposure Engine (`exposure_engine.py`)
Tracks cumulative thermal and atmospheric exposure:
- **Temperature**: Time above 25°C, time below 10°C, time in optimal range, excursion count, max deviation, cumulative degree-hours.
- **Humidity**: Time above 75%, time below 45%, excursion count, max deviation %.
- **Gas**: Time above 250 ppm, peak concentration, average concentration, recovery duration.

### 5. Multi-Sensor Anomaly & Trend Engine (`sensor_intelligence_service.py`)
Detects single-sensor, compound multi-sensor (e.g. simultaneous High Temp + High Hum), and signal quality anomalies with severity ratings (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) and explainable reasons.

### 6. Sensor ML Prototype Model (`ml/sensor_model.py`, `ml/sensor_features.py`)
Extracts a 10-dimensional feature vector and runs a transparent baseline risk model:
- **Model Metadata**:
  ```json
  {
    "modelName": "sensor-environment-model",
    "version": "0.1.0",
    "type": "prototype",
    "validated": false
  }
  ```
- **Outputs**: `environmentRisk` (0-100), `trend`, `confidence`, `contributingFactors`.

---

## REST API Endpoints

- `GET /api/sensors/environment/:nodeId`: Complete live node environment intelligence & ML risk score.
- `GET /api/sensors/environment/:nodeId/trends`: Rolling trends and hourly rates of change.
- `GET /api/sensors/environment/:nodeId/exposure`: Cumulative exposure breakdown.
- `GET /api/sensors/environment/:nodeId/anomalies`: Detected anomalies and quality alerts.
- `GET /api/sensors/environment/:nodeId/quality`: Detailed signal quality diagnostic.
- `GET /api/shipments/:shipmentId/environment/timeline`: Environmental event timeline.
- `GET /api/sensor-model/status`: ML model metadata & feature definition.
