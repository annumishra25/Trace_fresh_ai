# TraceFresh-AI Step 9: Cloud-Ready Architecture & Security Assessment

## 1. Executive Summary
Step 9 upgrades TraceFresh-AI from a local file-backed prototype to a **Cloud-Ready, Database-backed, Authenticated, and Production-Hardened System**, while preserving zero-friction local development and 100% backward compatibility with Steps 1–8.

---

## 2. Current Architecture vs. Target Production Architecture

### **Current Baseline (Steps 1–8)**
- **Frontend**: React 19 + Vite + TailwindCSS. Single-Page Application with React Router.
- **Backend**: Python Flask REST API listening on port 5000.
- **Persistence**: File-based JSON stores in `backend/data/*.json` (`batches.json`, `telemetry.json`, `nodes.json`, `inspections.json`, `fusion_decisions.json`, `qr_identities.json`, `passports.json`).
- **Security**: No backend authentication or role access controls; permissive `CORS(app)` allowing any origin; public endpoints exposing internal batch details.

### **Target Production Architecture (Step 9)**
- **Configuration**: Managed via `.env` with environment variables (`FLASK_ENV`, `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, `JWT_SECRET_KEY`, `LOG_LEVEL`). Zero hardcoded secrets.
- **Database Abstraction**: Dual-mode SQLAlchemy ORM persistence layer.
  - **Local Development**: Embedded SQLite database (`backend/data/tracefresh.db`) with zero setup overhead.
  - **Production Deployment**: PostgreSQL via `DATABASE_URL` with connection pooling.
- **Authentication & RBAC**: JWT token authentication with secure password hashing (`Werkzeug.security` / `bcrypt`). Three RBAC roles: `ADMIN`, `OPERATOR`, `VIEWER`.
- **API Security & Public Sanitization**: Protected operator endpoints via `@require_auth` and `@require_role`. Public QR verification (`/api/public/verify/<token>`) remains 100% unauthenticated and sanitized.
- **Telemetry Validation**: Validation of device token, numerical bounds, and timestamp integrity on `/api/telemetry`.
- **Production WSGI & Containerization**: `Gunicorn` WSGI server, root `Dockerfile`, and `docker-compose.yml` orchestrating backend and PostgreSQL.

---

## 3. Security & Production-Readiness Gap Analysis

| Gap Category | Current Limitation | Step 9 Resolution |
| :--- | :--- | :--- |
| **Secrets & Keys** | Hardcoded default keys in routes | Environment-driven config via `backend/config.py` and `.env` |
| **Persistence** | File lock JSON reading/writing | Relational database (SQLite/PostgreSQL) with migration script |
| **Authentication** | None (All endpoints open) | JWT token authentication (`POST /api/auth/login`) |
| **Role Authorization** | None | Enforced RBAC (`ADMIN`, `OPERATOR`, `VIEWER`) |
| **CORS** | Open `CORS(app)` | Strict origin filtering from `CORS_ORIGINS` |
| **Rate Limiting** | None | In-memory / Redis rate limiting on auth & public endpoints |
| **Error Handling** | Uncaught exceptions leak stack traces | Centralized JSON error handler (`FLASK_ENV=production`) |
| **Deployment** | Flask dev server (`app.run`) | `Gunicorn` WSGI server + Docker containerization |

---

## 4. Database Schema & Entity Relationships

```
                     ┌──────────────────┐
                     │      Users       │
                     ├──────────────────┤
                     │ id (PK)          │
                     │ username         │
                     │ password_hash    │
                     │ role (ENUM)      │
                     └──────────────────┘

┌──────────────────┐ 1      * ┌──────────────────┐ 1      * ┌──────────────────┐
│    Shipments     │ ───────► │     Batches      │ ───────► │    QRIdentities  │
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│ shipment_id (PK) │          │ batch_id (PK)    │          │ qr_id (PK)       │
│ name, origin     │          │ shipment_id (FK) │          │ public_token (IX)│
└──────────────────┘          └────────┬─────────┘          │ status (ENUM)    │
                                       │                    │ status (ENUM)    │
                               1       │ 1                  └──────────────────┘
                               ┌───────┴─────────┐
                               ▼                 ▼
                     ┌──────────────────┐ ┌──────────────────┐
                     │ FusionDecisions  │ │ DigitalPassports │
                     ├──────────────────┤ ├──────────────────┤
                     │ decision_id (PK) │ │ passport_id (PK) │
                     │ batch_id (FK)    │ │ batch_id (FK)    │
                     │ freshness_index  │ │ passport_hash    │
                     └──────────────────┘ └──────────────────┘
```

---

## 5. Migration Strategy
1. **JSON Data Migration Script**: `backend/scripts/migrate_json_to_db.py` automatically reads existing JSON files and populates database tables idempotently without deleting original JSON files.
2. **Backward-Compatible Local Setup**: If `DATABASE_URL` is omitted, the backend initializes SQLite automatically, allowing local development to continue seamlessly.
