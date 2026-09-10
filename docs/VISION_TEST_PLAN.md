# TraceFresh-AI Vision AI Test Plan

## Overview
This document outlines the test strategy and execution matrix for Step 6: Vision AI for Mold, Wax & Surface Anomaly Detection.

---

## Test Execution Matrix

| Test Case | Objective | Test Procedure | Expected Result | Status |
|---|---|---|---|---|
| **TC-VI-01** | Deterministic Image Hashing | Pass identical image bytes to hasher | Generates matching SHA-256 hash string | **PASS** |
| **TC-VI-02** | Image File Validation | Validate JPEG, unsupported `.exe`, and oversized files | Accepts JPEG/PNG/WebP, rejects unsupported & oversized files | **PASS** |
| **TC-VI-03** | Image Quality Diagnostics | Evaluate resolution, brightness, contrast, and blur | Scores quality (0-100), status (`GOOD`/`FAIR`/`POOR`), issues list | **PASS** |
| **TC-VI-04** | Visual Severity Engine | Pass `MOLD_LIKE` detection with 5.0% surface area | Computes severity `CRITICAL` & status `WARNING` | **PASS** |
| **TC-VI-05** | Deep Learning Keras Provider | Query `KerasFruitModelProvider` metadata | Exposes `fruit_model_v4` model name and class labels | **PASS** |
| **TC-VI-06** | Surface Anomaly Detector | Run heuristic feature detector on produce image | Extracts bounding boxes for `MOLD_LIKE`, `DISCOLORATION`, `WAX_LIKE_APPEARANCE` | **PASS** |
| **TC-VI-07** | Demo Vision Provider | Execute `predict_scenario("MOLD")` | Returns classification, bounding box, and area percentage | **PASS** |
| **TC-VI-08** | Unified Vision Inference Pipeline | Run `run_vision_inference()` on sample image | Returns quality report, classification, detections, and severity | **PASS** |
| **TC-VI-09** | Inspection Service Integration | Run inspection and save to persistent storage | Creates inspection record, updates batch store, logs timestamp | **PASS** |
| **TC-VI-10** | Batch History Lookup | Query `get_inspections_by_batch("TF-APL-2026-001")` | Returns list of historical inspection records | **PASS** |
| **TC-VI-11** | REST API Endpoints | Query `POST /api/inspect`, `POST /api/inspect/demo` | Returns 200 OK with formatted JSON payload | **PASS** |
| **TC-VI-12** | Interactive Vision UI | Render `VisionInspectionPanel` on dashboard | Displays interactive image canvas with bounding box overlays & demo controls | **PASS** |

---

## Command to Run Tests
```bash
uv run --with flask --with flask-cors --with requests --with numpy --with pillow python -m unittest discover -s backend/tests
```
Result: `Ran 44 tests in 2.683s - OK`
