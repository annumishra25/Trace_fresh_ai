# TraceFresh-AI Step 9: Cloud Deployment & Setup Guide

## 1. Overview
TraceFresh-AI supports two deployment modes:
1. **Local Development Mode**: Embedded SQLite database (`backend/data/tracefresh.db`) with zero external database dependencies.
2. **Cloud / Production Mode**: Production WSGI (`Gunicorn`), PostgreSQL database (`DATABASE_URL`), JWT authentication, and multi-container Docker deployment (`Dockerfile`, `docker-compose.yml`).

---

## 2. Environment Configuration (`.env`)

Copy `.env.example` to `.env` in the root workspace and configure appropriate variables:

```bash
# Server Environment
FLASK_ENV=production
PORT=5000
HOST=0.0.0.0

# Security Secrets (Must be changed in production!)
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-production-jwt-key
X_DEVICE_TOKEN=your-hardware-ingest-token

# Database URL (PostgreSQL)
DATABASE_URL=postgresql://tracefresh_user:secure_password@localhost:5432/tracefresh_db

# CORS Allowed Origins
CORS_ORIGINS=https://dashboard.tracefresh.ai,http://localhost:5173

# Frontend API URL
VITE_API_BASE_URL=https://api.tracefresh.ai/api
```

---

## 3. Local Development Setup (Zero Friction)

### Step 1: Install Python Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: Initialize & Migrate Database
```bash
python backend/scripts/migrate_json_to_db.py
```

### Step 3: Start Backend Flask Server
```bash
python backend/app.py
```
*(Backend runs on `http://127.0.0.1:5000` with SQLite DB).*

### Step 4: Start Frontend Vite Server
```bash
npm run dev
```
*(Frontend runs on `http://localhost:5173`).*

---

## 4. Docker Production Deployment

### Single-Command Docker Compose:
```bash
docker-compose up -d --build
```

### Verify Container Status:
```bash
docker-compose ps
```

### Backend Health Check:
```bash
curl http://localhost:5000/api/health/db
```

---

## 5. Pre-Seeded Default Accounts

| Username | Password | Role | Access Scope |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | `ADMIN` | Full access, user management, QR creation, all analytics |
| `operator` | `Operator@123` | `OPERATOR` | Operational dashboard, device monitoring, QR generation |
| `viewer` | `Viewer@123` | `VIEWER` | Read-only operational dashboard monitoring |
