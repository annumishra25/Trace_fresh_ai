# TraceFresh-AI Step 9: Security & Compliance Architecture

## 1. Authentication & JWT Engine
- **Password Hashing**: PBKDF2/scrypt key derivation via `Werkzeug.security`. Passwords and password hashes are never exposed through API responses.
- **JWT Token Verification**: Signed tokens using `HS256` with 24-hour expiration (`backend/services/auth_service.py`).
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: User management, device registration, QR revocation, full analytics.
  - `OPERATOR`: Shipment creation, QR generation, batch inspection.
  - `VIEWER`: Read-only telemetry and decision monitoring.

---

## 2. Public Verification Sanitization
Public consumer verification (`/api/public/verify/<token>` & `/verify/:publicToken`) remains **100% unauthenticated**.
- **Sanitized Outputs**: Public response conceals internal node IDs (`TF-NODE-01`), raw calibration parameters, internal database primary keys, and raw decision trace JSONs.
- **Scientific Claims Policy**: Public responses use decision-support phrasing ("TraceFresh condition indicator", "Monitored journey", "Visual surface scan") and strictly forbid unsupported claims ("100% safe", "chemical-free", "lab certified").

---

## 3. Rate Limiting & Abuse Prevention
- **In-Memory Rate Limiter** (`backend/utils/rate_limiter.py`): Protects `/api/auth/login` (15 req/min) and `/api/public/verify` (30 req/min) against brute-force attacks.

---

## 4. Production Security Headers
Every HTTP response includes standard security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `CORS-Origins`: Restricted to configured origins from `CORS_ORIGINS`.
