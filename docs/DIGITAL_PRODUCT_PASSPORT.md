# TraceFresh-AI Step 8: Digital Product Passport Architecture

## 1. Overview
The **Digital Product Passport (DPP)** aggregates trusted multi-modal data from across the TraceFresh pipeline into a unified, versioned, and integrity-verified digital record.

---

## 2. Multi-Layer Pipeline Aggregation

```
Step 1–3: Hardware & Telemetry Nodes  ──┐
Step 4:   Route Engine Service       ──┼──► Digital Product Passport Service
Step 5:   Sensor Intelligence ML     ──┤       (passport_service.py)
Step 6:   Vision AI Inspection       ──┤                 │
Step 7:   Multi-Modal Fusion Engine  ──┘                 ▼
                                             Public Passport Transformer
                                          (public_passport_service.py)
                                                         │
                                                         ▼
                                             Consumer Verification Portal
                                              (/verify/:publicToken)
```

---

## 3. Data Privacy & Consumer Sanitization Rules

| Category | Operator Internal View | Public Consumer Passport View |
| :--- | :--- | :--- |
| **Node Identity** | `TF-NODE-01`, IP addresses, MAC IDs | Concealed (Displays "TraceFresh Monitored Node") |
| **Raw Telemetry** | Raw ADC counts, calibration constants | Sanitized Storage Ranges (e.g. "3.5°C - 5.0°C") |
| **Decision Trace** | Machine-readable JSON execution trace | Human-readable Evidence Summaries & Drawers |
| **Visual Scans** | Raw bounding box coordinates, model confidence % | "No visible surface anomalies detected" |
| **Freshness Claim** | Multi-modal risk score (0-100) | Prototype Freshness Indicator (0-100) + Advisory |

---

## 4. Passport Data Integrity Checksum (`passportHash`)
Each passport payload includes a SHA-256 integrity hash calculated over canonical passport fields:

$$\text{passportHash} = \text{sha256}(\text{CanonicalJSON}(\text{passportPayload} \setminus \{\text{passportHash}\}))$$

This checksum allows stakeholders to verify that historical passport records have not been altered.

---

## 5. Consumer Scientific Language Compliance
Public verification outputs strictly adhere to decision-support terminology:
- **Allowed**: "TraceFresh condition indicator", "Monitored journey", "Visual surface scan", "Prototype freshness score".
- **Prohibited**: "100% safe", "Guaranteed fresh", "Pesticide-free", "Lab certified", "Chemical-free".
