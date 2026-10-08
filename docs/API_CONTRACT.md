# RescueHive — API Contract (Phase 0 Foundation)

## Overview
This document specifies the foundational HTTP contracts for the RescueHive Platform.

---

## Base URL
- Local Development: `http://localhost:8000/api/v1`
- Swagger Interactive UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`

---

## 1. System Health Endpoint

### `GET /api/v1/health`
Retrieves service operational status and identity.

- **Authentication**: None (Public)
- **Rate Limit**: None
- **Response Code**: `200 OK`
- **Content-Type**: `application/json`

#### Response Body:
```json
{
  "status": "ok",
  "service": "rescuehive-backend"
}
```

---

## 2. Planned API Endpoints (Phases 1 — 5)

| Method | Endpoint | Description | Planned Phase |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Issue JWT access & refresh tokens | Phase 2 |
| POST | `/api/v1/auth/register` | Register operator or commander | Phase 2 |
| GET | `/api/v1/robots` | List all registered robots & states | Phase 2 |
| GET | `/api/v1/robots/{id}` | Retrieve individual robot state | Phase 2 |
| GET | `/api/v1/missions` | Active & historical missions list | Phase 2 |
| POST | `/api/v1/missions` | Create and initialize a new mission | Phase 2 |
| GET | `/api/v1/detections` | Human-in-the-loop detection queue | Phase 3 |
| POST | `/api/v1/detections/{id}/confirm` | Human operator confirms detection | Phase 3 |
| POST | `/api/v1/detections/{id}/reject` | Human operator rejects detection | Phase 3 |
| WS | `/ws/telemetry` | Bi-directional robot & client telemetry | Phase 4 |
