# TraceFresh-AI Step 7: Multi-Modal Fusion Engine & Explainable Freshness Intelligence

## 1. Executive Overview
The **TraceFresh-AI Multi-Modal Fusion Engine** serves as the central decision support and condition intelligence synthesis layer. It integrates inputs from:
1. **Sensor Intelligence Service** (Step 5: thermal excursions, humidity spikes, gas decay proxies, storage score)
2. **Route Engine Service** (Step 4: ETA delays, corridor deviations, traffic/weather risk)
3. **Vision AI Service** (Step 6: mold-like, rot, discoloration, surface sheen, image quality)
4. **Batch & Shipment Metadata** (Commodity decay rates, origin nodes, target shelf life)

It outputs a unified, explainable condition decision, prototype Freshness Index (0-100), non-guaranteed estimated shelf life, overall confidence rating (0.0-1.0), and a standardized `passportSummary` schema ready for Step 8 Digital Product Passport integration.

---

## 2. Multi-Modal Fusion Architecture

```
                               ┌───────────────────────────┐
                               │  Sensor Intelligence ML   │ (Weight: 0.40)
                               └─────────────┬─────────────┘
                                             │
┌───────────────────────────┐                ▼                ┌───────────────────────────┐
│     Route Engine API      │ ────────► FUSION ENGINE ◄────── │      Vision AI Engine     │
│       (Weight: 0.25)      │       DECISION PIPELINE         │       (Weight: 0.35)      │
└───────────────────────────┘                │                └───────────────────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │ Cross-Signal Interaction Rules│
                             │ (Temp+Delay, Humidity+Mold)   │
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │ Conflict Resolution & Status  │
                             │ (NORMAL, SIGNAL_CONFLICT, etc)│
                             └───────────────┬───────────────┘
                                             │
                                             ▼
                             ┌───────────────────────────────┐
                             │ Explainable Output Generator  │
                             │ & Passport Summary Export     │
                             └───────────────────────────────┘
```

---

## 3. Mathematical Weighting & Cross-Signal Interaction Rules

### Base Weight Configuration
$$\text{Base Weighted Risk} = (0.40 \cdot \text{SensorRisk}) + (0.25 \cdot \text{RouteRisk}) + (0.35 \cdot \text{VisualRisk})$$

### Cross-Signal Interaction Rules
When multiple negative indicators coincide, compounding risk multipliers are applied:
1. **Rule A — Temp Excursion + Route Delay (`TEMP_EXCURSION_AND_ROUTE_DELAY`)**:
   - Trigger: `SensorRisk >= 35` AND `RouteRisk >= 35`
   - Multiplier: `x1.35`
2. **Rule B — High Humidity + Mold Risk (`HUMIDITY_AND_MOLD_RISK`)**:
   - Trigger: `SensorRisk >= 30` AND `VisualRisk >= 50`
   - Multiplier: `x1.40`
3. **Rule C — Critical Multi-Excursion (`CRITICAL_MULTI_EXCURSION`)**:
   - Trigger: `SensorRisk >= 60` AND `RouteRisk >= 50` AND `VisualRisk >= 50`
   - Multiplier: `x1.50`

$$\text{Final Risk Score} = \min(100.0, \text{Base Weighted Risk} \cdot \prod \text{Active Multipliers})$$

---

## 4. Confidence Engine & Penalty Model

$$\text{Overall Confidence} = (0.40 \cdot C_{\text{sensor}}) + (0.25 \cdot C_{\text{route}}) + (0.35 \cdot C_{\text{vision}})$$

### Penalty Triggers:
- **Image Blur / Poor Quality**: Visual confidence reduced by `0.70x` multiplier if quality score `< 60` or status is `BLURRY`.
- **Stale GPS Telemetry**: Route confidence reduced by `0.75x` multiplier if location age `> 3600 seconds`.
- **Stale Sensor Data**: Sensor confidence reduced by `0.80x` multiplier if telemetry age `> 1800 seconds`.

---

## 5. Signal Conflict Resolution Strategy
When primary modalities contradict each other:
- **Case 1 (Normal Sensors vs. Visual Mold)**: `SensorRisk <= 20` and `VisualRisk >= 55`.
  - Resolution: Flag as `SIGNAL_CONFLICT` status. Alert operator that local surface decay has begun despite optimal container environment readings.
- **Case 2 (Severe Excursion vs. Fresh Vision)**: `SensorRisk >= 60` and `VisualRisk <= 20`.
  - Resolution: Flag as `SIGNAL_CONFLICT` status. Alert operator that internal thermal stress occurred even though exterior damage is not yet visible.

---

## 6. REST API Endpoint Specifications

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/fusion/batch/<batch_id>` | `GET` | Retrieve complete multi-modal fusion decision for a batch |
| `/api/fusion/shipment/<shipment_id>` | `GET` | Retrieve fusion decision for all batches in a shipment |
| `/api/fusion/batch/<batch_id>/explanation` | `GET` | Retrieve evidence-based human explainability synthesis |
| `/api/fusion/batch/<batch_id>/decision-trace` | `GET` | Inspect machine-readable execution trace log |
| `/api/fusion/batch/<batch_id>/timeline` | `GET` | Retrieve chronological multi-modal event history |
| `/api/fusion/evaluate` | `POST` | Trigger fresh multi-modal evaluation |
| `/api/fusion/demo` | `POST` | Execute one of 7 demo scenarios |

---

## 7. Standardized Digital Passport Summary Schema (`passportSummary`)
```json
{
  "passportId": "PASSPORT-TF-APL-2026-001",
  "batchId": "TF-APL-2026-001",
  "produceType": "APPLES",
  "originNode": "TF-NODE-01",
  "freshnessIndex": 90,
  "freshnessRating": "EXCELLENT",
  "conditionStatus": "NORMAL",
  "estimatedRemainingDays": 7.7,
  "confidence": 0.9,
  "summaryStatement": "NORMAL condition assessment for APPLES (Composite Risk: 10.0/100)."
}
```
