# TraceFresh-AI: Smart Food Supply-Chain Monitoring & Digital Product Passport Platform

TraceFresh-AI is an end-to-end intelligent food monitoring platform integrating IoT sensors, GPS route tracking, environmental machine learning, computer vision AI, multi-modal fusion decision support, and QR-powered consumer product passports.

---

## Architecture Overview (Steps 1–9)

- **Step 1 — Data Pipeline & Telemetry Foundation**: Telemetry payload schemas, validation, storage, and live React dashboard.
- **Step 2 — Real Hardware Integration**: ESP32/MCU firmware, HTTP telemetry ingestion, and live/simulated hardware separation.
- **Step 3 — Multi-Node Device Health**: Dual node monitoring (`TF-NODE-01` & `TF-NODE-02`), battery health, and side-by-side diagnostic comparison.
- **Step 4 — GPS Tracking & Route Engine**: Planned vs actual route monitoring, ETA delay analysis, and corridor deviation alerts.
- **Step 5 — Sensor ML & Environmental Exposure**: Temperature/humidity excursion scoring, exposure time tracking, and degradation proxies.
- **Step 6 — Vision AI Inspection**: Surface anomaly detection for mold-like patches, discoloration, bruising, and wax-like sheen.
- **Step 7 — Multi-Modal Fusion Engine**: Cross-signal interaction rules, signal conflict resolution, and prototype freshness index (0-100).
- **Step 8 — QR Traceability & Consumer Verification**: Public verification URL (`/verify/:publicToken`), QR lifecycle state management, and consumer passport portal.
- **Step 9 — Cloud-Ready & Production Architecture**: Environment-based config, dual SQLite/Postgres ORM persistence, JWT authentication, RBAC, API security, and Docker containerization.

---

## Quick Start (Local Development)

### 1. Backend Setup (Flask + SQLite)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Migrate initial data
python scripts/migrate_json_to_db.py

# Start backend server (listening on http://127.0.0.1:5000)
python app.py
```

### 2. Frontend Setup (React + Vite)
```bash
# Install Node dependencies
npm install

# Start Vite development server (listening on http://localhost:5173)
npm run dev
```

---

## Pre-Seeded Default Authentication Accounts

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | Full access, user management, QR control |
| **Operator** | `operator` | `Operator@123` | Operational dashboard, devices, QR creation |
| **Viewer** | `viewer` | `Viewer@123` | Read-only operational dashboard access |

---

## Testing & Verification

### Run Backend Unit Test Suite (65 Tests)
```bash
uv run --with flask --with flask-cors --with requests --with numpy --with pillow --with pyjwt --with sqlalchemy --with python-dotenv python -m unittest discover -s backend/tests
```

### Build Frontend Production Distribution
```bash
npm run build
```

---

## Docker Production Deployment
```bash
docker-compose up -d --build
```

---

## Documentation
- [`docs/STEP9_ARCHITECTURE.md`](file:///c:/Users/annu1/OneDrive/Desktop/tracefresh-ai/docs/STEP9_ARCHITECTURE.md)
- [`docs/DEPLOYMENT.md`](file:///c:/Users/annu1/OneDrive/Desktop/tracefresh-ai/docs/DEPLOYMENT.md)
- [`docs/SECURITY.md`](file:///c:/Users/annu1/OneDrive/Desktop/tracefresh-ai/docs/SECURITY.md)
- [`docs/QR_TRACEABILITY.md`](file:///c:/Users/annu1/OneDrive/Desktop/tracefresh-ai/docs/QR_TRACEABILITY.md)
- [`docs/DIGITAL_PRODUCT_PASSPORT.md`](file:///c:/Users/annu1/OneDrive/Desktop/tracefresh-ai/docs/DIGITAL_PRODUCT_PASSPORT.md)
