# TraceFresh-AI Sensor Intelligence Test Plan

## Overview
This document outlines the test strategy and execution results for Step 5: Sensor ML & Environmental Exposure Intelligence.

---

## Test Execution Matrix

| Test Case | Objective | Test Procedure | Expected Result | Status |
|---|---|---|---|---|
| **TC-SI-01** | Sensor Normalization | Pass raw payload with missing/nested fields | Returns clean dict with normalized °C, %, ppm units | **PASS** |
| **TC-SI-02** | Sensor Quality Engine | Pass good, missing temp, and impossible jump data | Evaluates score (0-100), status (`GOOD`/`DEGRADED`), and issues | **PASS** |
| **TC-SI-03** | Baseline Rolling Stats | Pass numeric array to baseline engine | Computes mean, median, min, max, std dev accurately | **PASS** |
| **TC-SI-04** | Cumulative Exposure | Pass time series exceeding 25°C and 75% | Accumulates exposure minutes, excursion counts, degree-hours | **PASS** |
| **TC-SI-05** | Single-Sensor Anomalies | Feed 32°C temp and 85% humidity records | Generates `HIGH_TEMPERATURE_EXCURSION` & `HIGH_HUMIDITY_SURGE` | **PASS** |
| **TC-SI-06** | Compound Anomaly | Feed 31°C temp + 85% humidity simultaneously | Triggers `COMPOUND_THERMAL_HUMIDITY_STRESS` with CRITICAL severity | **PASS** |
| **TC-SI-07** | ML Feature Extractor | Pass telemetry and baseline to feature extractor | Vectorizes 10-dimensional feature array | **PASS** |
| **TC-SI-08** | ML Prototype Model | Run `predict()` on high risk telemetry | Returns `environmentRisk` > 50, trend, and contributing factors | **PASS** |
| **TC-SI-09** | Model Versioning Metadata | Query model metadata structure | Exposes `version: "0.1.0"`, `type: "prototype"`, `validated: false` | **PASS** |
| **TC-SI-10** | Multi-Node Isolation | Process telemetry for `TF-NODE-01` and `TF-NODE-02` | Environmental intelligence metrics remain strictly isolated | **PASS** |
| **TC-SI-11** | REST API Endpoints | Query `/api/sensors/environment/:nodeId` | Returns 200 OK with complete JSON payload | **PASS** |
| **TC-SI-12** | React Exposure UI | Render `EnvironmentalExposureCard` on dashboard | Displays risk index, exposure metrics, anomaly timeline | **PASS** |

---

## Command to Run Tests
```bash
uv run --with flask --with flask-cors --with requests --with numpy python -m unittest discover -s backend/tests
```
Result: `Ran 37 tests in 1.175s - OK`
