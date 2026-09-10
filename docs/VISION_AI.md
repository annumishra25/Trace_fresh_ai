# TraceFresh-AI Vision AI & Surface Anomaly Detection Architecture

## Overview
Step 6 introduces the **Vision AI Inspection Engine** for fresh produce quality assessment. The system ingests uploaded produce images or camera streams, validates image file security & resolution quality, runs deep-learning classification (`fruit_model_v4.keras`), executes surface anomaly detection for color/contour/sheen metrics (`MOLD_LIKE`, `DISCOLORATION`, `BRUISING`, `WAX_LIKE_APPEARANCE`), computes visual severity, and renders interactive bounding box overlays on the dashboard.

---

## System Architecture

```
          IMAGE INGESTION (UPLOAD / CAMERA STREAM / DEMO)
          ┌──────────────────────────────────────────────┐
          │     JPG / PNG / WebP Produce Image Upload    │
          └──────────────────────┬───────────────────────┘
                                 │
                           Flask Backend
                                 │
                        vision_preprocess.py
                         (Validation & Hash)
                                 │
                         image_quality.py
                         (Luminance & Blur)
                                 │
                        vision_inference.py
               ┌─────────────────┴─────────────────┐
               ↓                                   ↓
   KerasFruitModelProvider               SurfaceAnomalyDetector
 (Classification Model v4)             (Color / Sheen Features)
               │                                   │
               └─────────────────┬─────────────────┘
                                 ↓
                     vision_severity_engine.py
                                 │
                                 ↓
                     inspection_service.py
                                 │
                                 ↓
                     inspection_routes.py
                                 │
                                 ↓
                      React Dashboard Console
                    (VisionInspectionPanel.jsx)
```

---

## Detection Categories & Standards

| Category Label | Description | Visual Severity Weight |
|---|---|---|
| `MOLD_LIKE` | Irregular surface growth with high color variance | High / Critical |
| `DISCOLORATION` | Browning or uneven surface pigmentation | Medium / High |
| `BRUISING` | Indented surface region from handling impact | Medium / High |
| `ROT_LIKE_DAMAGE` | Surface decay pattern or structural degradation | Critical |
| `WAX_LIKE_APPEARANCE` | High specular light reflection / protective coating sheen | Low / Information |
| `SURFACE_SPOT` | Minor localized spots or blemishes | Low / Medium |
| `CRACK` / `CUT` | Visible surface split or physical cut | High |

---

## Image Quality Diagnostic Metrics

- **Resolution Check**: Rejects images smaller than $200\times 200$px.
- **Luminance / Exposure**: Flags underexposed ($<40$) or overexposed ($>220$) images.
- **Contrast**: Flags standard deviation of intensity $<20$.
- **Blur / Sharpness**: Estimates pixel gradient variance ($<3.5$ flags blur).
- **Recommendation**: Flags `"RETAKE_IMAGE_RECOMMENDED"` if quality score $< 40$.

---

## REST API Endpoints

- `POST /api/inspect`: Upload produce image for real-time Vision AI analysis.
- `GET /api/inspect/:inspectionId`: Fetch single inspection record.
- `GET /api/inspect/batch/:batchId`: Fetch historical inspection timeline for a batch.
- `GET /api/inspect/node/:nodeId`: Fetch inspections associated with a physical monitoring node.
- `POST /api/inspect/demo`: Execute a controlled Expo demo scenario (`HEALTHY`, `MOLD`, `DISCOLORATION`, `BRUISING`, `WAX`).
