# TraceFresh-AI Step 8: QR Traceability Architecture & Specifications

## 1. Overview
The **QR Traceability Engine** links physical produce shipments/boxes to their server-side digital twins and public verification passports.

---

## 2. Identity Separation Model
To prevent cross-entity confusion and safeguard internal systems, TraceFresh enforces strict separation between identity layers:

| Identity Key | Prefix | Example | Description |
| :--- | :--- | :--- | :--- |
| `shipmentId` | `SHIP-` | `SHIP-APL-110` | Logistics shipment container/corridor |
| `batchId` | `TF-` / `BATCH-` | `TF-APL-2026-001` | Unique produce harvest batch |
| `containerId` | `CONT-` | `CONT-TF-APL-2026-001` | Physical pallet/box container identifier |
| `nodeId` | `TF-NODE-` | `TF-NODE-01` | Physical hardware monitoring device |
| `qrId` | `QR-` | `QR-TF-APL-2026-001-A1B2` | Internal QR identity tracking record |
| `publicToken` | `TR-VER-` | `TR-VER-89A7B3E1F4C2D0E5` | Non-guessable public verification token |
| `passportId` | `PASS-` | `PASS-TF-APL-2026-001` | Aggregated digital product passport |

---

## 3. Public Verification Token Security
- **Token Format**: `TR-VER-` + 16 random upper-case hexadecimal characters generated via cryptographically secure random bytes (`secrets.token_hex(8)`).
- **Public Destination Payload**: `/verify/{publicToken}` (e.g. `http://localhost:5173/verify/TR-VER-89A7B3E1F4C2D0E5`).
- **Data Privacy**: The QR code encodes only the public verification URL. It does NOT embed raw telemetry data, internal node IDs, database primary keys, or server credentials.

---

## 4. QR Identity Lifecycle States

```
                 ┌──────────┐
                 │  ACTIVE  │ ◄────── Create / Initial Issue
                 └────┬─────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
      ┌──────────┐        ┌──────────┐
      │ REVOKED  │        │ REPLACED │
      └──────────┘        └──────────┘
```

1. **`ACTIVE`**: Token is valid and resolves to the consumer product passport.
2. **`INACTIVE`**: Token paused temporarily by operator.
3. **`REVOKED`**: Token permanently invalidated by operator (e.g. box damage, manual recall).
4. **`REPLACED`**: Superseded when an operator requests a new QR token for a batch. Old token resolves to `REPLACED` status banner.
5. **`EXPIRED`**: Token exceeded configured validity period.

---

## 5. REST API Specifications

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/qr/create` | Issue or replace QR identity for a batch |
| `GET` | `/api/qr/batch/<batch_id>` | Fetch active QR record for a batch |
| `GET` | `/api/qr/<qr_id>` | Fetch single QR identity record |
| `GET` | `/api/qr/verify/<public_token>` | Operator verification endpoint |
| `POST` | `/api/qr/<qr_id>/deactivate` | Deactivate/revoke QR identity |
| `GET` | `/api/public/verify/<public_token>` | Unauthenticated public consumer verification endpoint |
| `GET` | `/api/public/demo/<scenario_id>` | Unauthenticated consumer demo scenario endpoint |
