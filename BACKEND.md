# RescueHive — Backend Specification

This document specifies the FastAPI backend that powers the RescueHive frontend.
It is written to be a drop-in contract: every model, endpoint, and WebSocket
message here matches the TypeScript types already defined in the frontend
(`src/types/domain.ts`, `src/types/websocket.ts`), so the two can be built in
parallel and wired together with minimal friction.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | FastAPI (Python 3.11+) | async-first, native OpenAPI docs |
| ORM | SQLAlchemy 2.0 (async) + Alembic | migrations |
| Database | PostgreSQL 15+ | primary store |
| Cache / pub-sub | Redis | WebSocket fan-out, rate limiting, session cache |
| Realtime | FastAPI native WebSockets + Redis Pub/Sub | horizontal scaling across workers |
| Auth | JWT (access + refresh), `python-jose` or `PyJWT` | short-lived access token, rotating refresh token |
| Validation | Pydantic v2 | request/response schemas |
| File/image storage | S3-compatible bucket (AWS S3 / MinIO) | detection images, camera snapshots, exported reports |
| Task queue | Celery or FastAPI `BackgroundTasks` + Redis | report generation, image processing |
| Web server | Uvicorn + Gunicorn (prod) | ASGI |
| Containerization | Docker + docker-compose | local dev parity |

---

## 2. High-Level Architecture

```
                         ┌─────────────────────┐
                         │   Robot Fleet Edge   │
                         │  (ROS2 / onboard AI) │
                         └──────────┬───────────┘
                                    │ MQTT / gRPC / custom link
                                    ▼
                         ┌─────────────────────┐
                         │   Fleet Gateway      │  ← normalizes robot telemetry
                         │  (ingest service)    │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    ▼               ▼                ▼
             ┌───────────┐  ┌─────────────┐   ┌─────────────┐
             │ PostgreSQL│  │  Redis Pub/  │   │  S3 Bucket  │
             │ (state)   │  │  Sub (fanout)│   │  (images)   │
             └───────────┘  └──────┬──────┘   └─────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   FastAPI Backend    │
                         │  REST + WebSocket    │
                         └──────────┬───────────┘
                                    │
                          REST (Axios) + WS (native)
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  RescueHive Frontend  │
                         └─────────────────────┘
```

The Fleet Gateway is a separate ingest concern (robots rarely speak HTTP/JSON
natively) — it translates raw robot telemetry into the normalized messages
described in Section 5, then publishes them to Redis. The FastAPI backend
subscribes to Redis and fans messages out to connected WebSocket clients, and
persists relevant state to PostgreSQL.

---

## 3. Authentication

JWT-based, matching the frontend's `authStore` (`POST /auth/login`, Bearer
token on all subsequent requests).

### 3.1 Flow

1. `POST /auth/login` → validates credentials, returns `access_token` (short-lived, 15 min) and `refresh_token` (httpOnly cookie or long-lived JWT, 7 days if "remember me").
2. Frontend sends `Authorization: Bearer <access_token>` on every request (see `src/services/api/client.ts` interceptor).
3. On `401`, frontend logs the user out. Recommended enhancement: add `POST /auth/refresh` and have the Axios interceptor attempt a silent refresh before logging out.
4. `POST /auth/logout` invalidates the refresh token (blacklist in Redis or DB row).

### 3.2 Roles

Matches `Role` in `domain.ts` exactly:

```
support | field_operator | incident_commander | system_administrator | developer
```

Role is embedded in the JWT payload and re-validated server-side on every
protected route via a FastAPI dependency (`require_role([...])`) — the
frontend's `ProtectedRoute` component is a UX convenience, not a security
boundary; **all authorization must be enforced server-side.**

### 3.3 Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/login` | `{ email, password, remember_me }` | `{ access_token, refresh_token, user }` |
| POST | `/auth/refresh` | `{ refresh_token }` | `{ access_token }` |
| POST | `/auth/logout` | — | `204` |
| POST | `/auth/forgot-password` | `{ email }` | `202` (always, to avoid user enumeration) |
| POST | `/auth/reset-password` | `{ token, new_password }` | `204` |
| GET | `/auth/me` | — | `User` |

---

## 4. Data Models (Pydantic / DB schema)

These mirror `src/types/domain.ts` field-for-field so the frontend requires
zero transformation on response payloads (camelCase on the wire — configure
Pydantic's `alias_generator` to convert `snake_case` DB fields to camelCase
JSON, or have the frontend adapter map it; camelCase-on-the-wire is
recommended to keep the contract identical to the TS types shown below).

### 4.1 User

```python
class Role(str, Enum):
    support = "support"
    field_operator = "field_operator"
    incident_commander = "incident_commander"
    system_administrator = "system_administrator"
    developer = "developer"

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    avatar_url: str | None = None
    callsign: str | None = None
```

DB table `users`: `id (uuid pk)`, `name`, `email (unique)`, `password_hash`,
`role`, `avatar_url`, `callsign`, `created_at`, `updated_at`, `is_active`.

### 4.2 Mission

```python
class MissionStatus(str, Enum):
    planning = "planning"
    active = "active"
    paused = "paused"
    completed = "completed"
    aborted = "aborted"

class Mission(BaseModel):
    id: str
    name: str
    status: MissionStatus
    started_at: datetime
    ended_at: datetime | None = None
    area_coverage: float          # 0-100
    robots_active: int
    victims_found: int
    hazards_found: int
    average_battery: float
    connection_health: Literal["live", "degraded", "stale", "offline"]
    location: str
    search_area_km2: float
```

DB table `missions`: as above, plus `commander_id (fk -> users)`,
`created_at`, `updated_at`. `victims_found` / `hazards_found` /
`robots_active` / `area_coverage` can be materialized columns updated on
write, or computed via a view — materialized is recommended for dashboard
read performance at scale.

### 4.3 Robot

```python
class RobotHealth(str, Enum):
    nominal = "nominal"
    warning = "warning"
    critical = "critical"
    offline = "offline"

class RobotTask(str, Enum):
    exploring = "exploring"
    returning_home = "returning_home"
    idle = "idle"
    charging = "charging"
    manual_control = "manual_control"
    e_stopped = "e_stopped"

class SensorStatus(BaseModel):
    lidar: Literal["ok", "degraded", "fault"]
    thermal: Literal["ok", "degraded", "fault"]
    camera: Literal["ok", "degraded", "fault"]
    gas: Literal["ok", "degraded", "fault"]

class Coordinates(BaseModel):
    lat: float
    lng: float

class Robot(BaseModel):
    id: str
    name: str
    callsign: str
    battery: float                 # 0-100
    signal: float                  # 0-100
    health: RobotHealth
    task: RobotTask
    temperature: float             # celsius
    speed: float                   # m/s
    position: Coordinates
    distance_travelled: float      # meters
    sensors: SensorStatus
    last_seen: datetime
    connection: Literal["live", "degraded", "stale", "offline"]
    trail: list[Coordinates]       # last N positions, capped server-side (e.g. 50)
    mission_id: str
```

DB tables:
- `robots`: static/slow-changing fields (`id`, `name`, `callsign`, `model`, `mission_id`, `created_at`).
- `robot_telemetry` (time-series, consider TimescaleDB or a partitioned table): `robot_id`, `timestamp`, `battery`, `speed`, `temperature`, `signal`, `lat`, `lng`, `health`, `task`, `connection`. Latest row per robot = current state; full history = trail/analytics.

### 4.4 Detections

```python
class Priority(str, Enum):
    low = "low"; medium = "medium"; high = "high"; critical = "critical"

class DetectionStatus(str, Enum):
    unconfirmed = "unconfirmed"; confirmed = "confirmed"; rejected = "rejected"

class VictimDetection(BaseModel):
    id: str
    mission_id: str
    robot_id: str
    robot_name: str
    image_url: str
    confidence: float              # 0-100
    position: Coordinates
    distance: float                # meters from robot
    priority: Priority
    detected_at: datetime
    status: DetectionStatus
    notes: str | None = None

class HazardType(str, Enum):
    fire = "fire"; gas_leak = "gas_leak"; debris = "debris"
    collapsed_structure = "collapsed_structure"; blocked_path = "blocked_path"

class HazardSeverity(str, Enum):
    low = "low"; moderate = "moderate"; severe = "severe"; extreme = "extreme"

class HazardDetection(BaseModel):
    id: str
    mission_id: str
    type: HazardType
    severity: HazardSeverity
    position: Coordinates
    robot_id: str
    robot_name: str
    image_url: str
    detected_at: datetime
    status: DetectionStatus
```

**Critical business rule:** `status` must default to `unconfirmed` on
insert and can only transition via an authenticated `PATCH` from a human
operator (`incident_commander` or `field_operator`). The API must never
auto-confirm a detection, regardless of AI confidence score — this mirrors
the frontend's "never visually show a detection as confirmed until a human
accepts it" requirement, and it must be enforced here since the frontend is
not a trust boundary.

DB tables: `victim_detections`, `hazard_detections` as above, each with a
`confirmed_by (fk -> users, nullable)` and `confirmed_at (nullable)` audit
column.

### 4.5 System / Ops models

```python
class LogEntry(BaseModel):
    id: str
    timestamp: datetime
    level: Literal["debug", "info", "warn", "error"]
    source: str
    message: str

class SystemHealth(BaseModel):
    api_status: Literal["operational", "degraded", "down"]
    api_latency_ms: float
    db_status: Literal["operational", "degraded", "down"]
    ws_status: Literal["operational", "degraded", "down"]
    server_load: float             # percent
    uptime_percent: float

class AppNotification(BaseModel):
    id: str
    severity: Literal["info", "success", "warning", "critical"]
    title: str
    message: str
    timestamp: datetime
    read: bool
    category: Literal["mission", "robot", "detection", "hazard", "system"]
```

---

## 5. REST API Reference

Base URL: `/api` (configurable via frontend's `VITE_API_BASE_URL`). All
routes except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

### 5.1 Missions

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/missions` | any | List all missions (paginated, filterable by `status`, `q`) |
| GET | `/missions/{id}` | any | Mission detail |
| POST | `/missions` | incident_commander, system_administrator | Create mission |
| PATCH | `/missions/{id}` | incident_commander, system_administrator | Update mission metadata |
| POST | `/missions/{id}/start` | incident_commander, field_operator | Transition to `active` |
| POST | `/missions/{id}/pause` | incident_commander, field_operator | Transition to `paused` |
| POST | `/missions/{id}/stop` | incident_commander | Transition to `completed`/`aborted` |
| GET | `/missions/{id}/summary` | any | Aggregated stats for the AI Report page |
| GET | `/missions/{id}/images` | any | Paginated list of detection images for that mission |
| GET | `/missions/{id}/logs` | system_administrator, developer | Mission-scoped log entries |
| GET | `/missions/{id}/report` | any | Full AI-generated report payload (see 5.6) |

### 5.2 Robots

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/robots` | any | List robots (optionally `?mission_id=`) |
| GET | `/robots/{id}` | any | Robot detail |
| POST | `/robots/{id}/retask` | field_operator, incident_commander | Body: `{ task: RobotTask }` |
| POST | `/robots/{id}/emergency-stop` | field_operator, incident_commander | Sets `task=e_stopped` immediately, high-priority path (bypass normal queue) |
| POST | `/robots/{id}/return-home` | field_operator, incident_commander | Sets `task=returning_home` |
| GET | `/robots/{id}/trail` | any | Historical position trail (query `?since=`) |
| GET | `/robots/{id}/telemetry-history` | developer, system_administrator | Raw telemetry time-series for debugging |

### 5.3 Detections

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/detections/victims` | any | List victim detections (`?mission_id=`, `?status=`) |
| PATCH | `/detections/victims/{id}` | field_operator, incident_commander | Body: `{ status: "confirmed" \| "rejected", notes?: string }` |
| GET | `/detections/hazards` | any | List hazard detections |
| PATCH | `/detections/hazards/{id}` | field_operator, incident_commander | Confirm/reject a hazard |

Every `PATCH` on a detection must record `confirmed_by` = the authenticated
user's id and `confirmed_at` = now(), and should emit a `detection` WebSocket
message (or a dedicated `detection_updated` message) so all connected
clients reflect the change without polling.

### 5.4 Camera

| Method | Path | Description |
|---|---|---|
| GET | `/robots/{id}/camera` | Current feed metadata (`fps`, `latency_ms`, `is_live`, stream URL) |
| POST | `/robots/{id}/camera/snapshot` | Triggers a snapshot capture, returns image URL |
| WS | `/ws/camera/{robot_id}` | (optional) dedicated low-latency video signaling channel if not using a separate media server (see Section 7) |

### 5.5 Notifications

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | List, paginated |
| POST | `/notifications/read-all` | Mark all read for the current user |
| PATCH | `/notifications/{id}` | Mark one read |

### 5.6 Reports & Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/missions/{id}/report` | Full report: summary text, coverage timeline, victim priority breakdown, robot stats, AI recommendations |
| GET | `/analytics/coverage` | Time-series coverage data (`?range=7d`) |
| GET | `/analytics/detections` | Victims/hazards over time |
| GET | `/analytics/fleet-health` | Health distribution across the fleet |
| GET | `/analytics/battery` | Average battery trend |

The "AI Generated Recommendation — For Human Review Only" text block shown
on the frontend's Report page should be generated server-side (e.g. via an
LLM call summarizing mission telemetry + detections) and returned as a
plain string field, `ai_recommendations: list[str]`, in the report payload —
never rendered client-side without that disclaimer, and the backend should
tag the response so the frontend can enforce the disclaimer is always shown.

### 5.7 Admin

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/admin/users` | system_administrator | List users |
| POST | `/admin/users` | system_administrator | Create user |
| PATCH | `/admin/users/{id}` | system_administrator | Update role/status |
| DELETE | `/admin/users/{id}` | system_administrator | Deactivate user |
| GET | `/admin/fleet` | system_administrator | Full fleet inventory/config |
| PATCH | `/admin/fleet/{robot_id}` | system_administrator | Update robot config/metadata |

### 5.8 System Health

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/health` | public (no auth) | Basic liveness probe, `{ status: "ok" }` |
| GET | `/system/health` | system_administrator, developer | Full `SystemHealth` payload |
| GET | `/system/logs` | system_administrator, developer | Paginated `LogEntry[]`, filterable by `level`, `source` |

### 5.9 Error format

All errors return a consistent envelope so the frontend can render them
uniformly:

```json
{
  "error": {
    "code": "DETECTION_ALREADY_CONFIRMED",
    "message": "This detection has already been reviewed.",
    "status": 409
  }
}
```

Standard status codes: `400` validation, `401` unauthenticated, `403`
unauthorized (wrong role), `404` not found, `409` conflict (e.g. re-confirming
an already-resolved detection), `422` schema validation (FastAPI default),
`500` server error.

---

## 6. WebSocket Contract

Single endpoint: `wss://<host>/ws?token=<access_token>` (or pass the token as
a `Sec-WebSocket-Protocol` header / first message — query param is simplest
for browser `WebSocket` API compatibility, but rotate tokens frequently if
used this way).

This matches `src/types/websocket.ts` (`WsInboundMessage` discriminated
union) exactly — the frontend's mock socket (`mockSocket.ts`) already speaks
this contract, so switching from mock to real is a one-file change
(`useRealtimeConnection.ts`).

### 6.1 Message envelope

Every message is JSON with a `type` discriminator:

```ts
type WsInboundMessage =
  | TelemetryMessage
  | RobotStatusMessage
  | MapUpdateMessage
  | DetectionMessage
  | MissionProgressMessage;
```

### 6.2 `telemetry`

Emitted on every telemetry frame from a robot (recommend throttling to ~1
message/robot/second server-side even if the robot reports faster).

```json
{
  "type": "telemetry",
  "robotId": "robot-0001",
  "timestamp": "2026-07-27T10:15:32Z",
  "battery": 74.2,
  "speed": 1.15,
  "temperature": 41.3,
  "signal": 88,
  "position": { "lat": 34.0522, "lng": -118.2437 }
}
```

### 6.3 `robot_status`

Emitted on any health/task/connection state transition (not on a timer —
event-driven).

```json
{
  "type": "robot_status",
  "robotId": "robot-0001",
  "health": "warning",
  "task": "returning_home",
  "connection": "live",
  "timestamp": "2026-07-27T10:15:32Z"
}
```

### 6.4 `map_update`

Position + trail delta, decoupled from `telemetry` so the map can subscribe
independently of the telemetry panel (avoids unnecessary re-renders per the
frontend's "no unnecessary re-renders" requirement).

```json
{
  "type": "map_update",
  "robotId": "robot-0001",
  "position": { "lat": 34.0530, "lng": -118.2440 },
  "trail": [{ "lat": 34.0522, "lng": -118.2437 }, { "lat": 34.0530, "lng": -118.2440 }],
  "timestamp": "2026-07-27T10:15:32Z"
}
```

Server should cap `trail` to the last ~50 points per message; the frontend
also caps its in-memory trail, so sending the full history every time is
wasteful — send only the delta or a capped rolling window.

### 6.5 `detection`

```json
{
  "type": "detection",
  "kind": "victim",
  "payload": {
    "id": "victim-0231",
    "missionId": "mission-0001",
    "robotId": "robot-0004",
    "robotName": "Scout-42",
    "imageUrl": "https://cdn.rescuehive.io/detections/victim-0231.jpg",
    "confidence": 87,
    "position": { "lat": 34.0525, "lng": -118.2431 },
    "distance": 12,
    "priority": "high",
    "detectedAt": "2026-07-27T10:15:32Z",
    "status": "unconfirmed"
  }
}
```

`kind` is `"victim" | "hazard"`; `payload` shape switches accordingly
(`HazardDetection` for `kind: "hazard"`). New detections **must always** be
published with `status: "unconfirmed"`.

### 6.6 `mission_progress`

```json
{
  "type": "mission_progress",
  "missionId": "mission-0001",
  "areaCoverage": 63.4,
  "robotsActive": 8,
  "timestamp": "2026-07-27T10:15:32Z"
}
```

### 6.7 Connection lifecycle expectations

The frontend expects standard WebSocket behavior plus:

- **Auto-reconnect**: the frontend already implements exponential-ish
  backoff reconnect (see `mockSocket.ts`); the backend just needs to accept
  reconnecting clients cleanly and replay nothing (client re-fetches current
  state via REST on reconnect if a gap is detected — recommend the frontend
  call `GET /robots` + `GET /missions/{id}` on reconnect to resync, since WS
  is a stream, not a source of truth).
- **Heartbeat**: send a `ping` frame or a lightweight `{ "type": "ping" }`
  message every 30s; if the frontend doesn't need to consume it, ignore
  unknown `type` values gracefully (forward-compatible message parsing).
- **Auth expiry mid-connection**: if the access token expires while the
  socket is open, close with code `4401` and a reason string; frontend
  should treat this the same as a REST `401` (attempt refresh, then
  reconnect).
- **Scale**: for 10+ robots this is a modest message rate
  (~10-20 msgs/sec aggregate at 1Hz/robot); use Redis Pub/Sub so multiple
  FastAPI worker processes can all serve WebSocket clients without needing
  sticky sessions tied to a single process holding the robot connection.

---

## 7. Camera / Video Streaming

Raw video is not practical over the JSON WebSocket channel above. Recommended
approach:

- Each robot's camera stream is transcoded (edge or gateway) to **WebRTC**
  or **HLS/LL-HLS** and served from a dedicated media server (e.g.
  `mediamtx`, `Janus`, or a managed service).
- The REST endpoint `GET /robots/{id}/camera` returns metadata including the
  stream URL, which the frontend's Camera Monitoring page consumes directly
  (`<video>` element or an HLS.js player) rather than proxying frames through
  FastAPI.
- Thermal/depth overlays, if produced by onboard AI, can either be baked
  into the video stream server-side or sent as a parallel low-frequency
  WebSocket message (`type: "sensor_overlay"`) with bounding-box/heatmap
  metadata that the frontend draws as a canvas overlay — this is an
  extension beyond the current mock (which uses static placeholder images).

---

## 8. Deployment Notes

- **Environment variables**: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`,
  `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `S3_BUCKET`, `S3_REGION`,
  `CORS_ORIGINS` (must include the frontend's deployed origin).
- **CORS**: FastAPI's `CORSMiddleware` must allow the frontend origin with
  `allow_credentials=True` if using httpOnly refresh-token cookies.
- **Migrations**: Alembic, run as a release step before the new backend
  version receives traffic.
- **Horizontal scaling**: stateless FastAPI workers behind a load balancer;
  WebSocket affinity is not required as long as Redis Pub/Sub fans out
  messages to all workers (any worker can serve any client's socket).
- **Observability**: structured JSON logs (feeds the `/system/logs`
  endpoint and the Developer role's log viewer), plus metrics (Prometheus)
  for `server_load`/`uptime_percent` shown on the System Health page.
- **Rate limiting**: apply per-user rate limits on write endpoints
  (`/robots/{id}/emergency-stop` should be exempt or very generous — it's a
  safety-critical action that must never be throttled).

---

## 9. Frontend Integration Checklist

When the backend is ready, these are the only frontend files that need to
change — everything else consumes them through the store layer and never
needs to know whether data is mocked or real:

1. `src/services/websocket/mockSocket.ts` → replace with a real `WebSocket`
   client pointed at `VITE_WS_URL`; keep the same `onMessage` /
   `onStateChange` / `connect` / `disconnect` surface.
2. `src/services/api/missions.ts` (and equivalent files to be added for
   robots/detections/admin) → replace mock bodies with `apiClient.get/post`
   calls; signatures already match.
3. `.env` → set `VITE_API_BASE_URL` and `VITE_WS_URL`.
4. `src/stores/authStore.ts` → replace the mock `MOCK_USERS` lookup with a
   real call to `POST /auth/login`.

No component, page, or store *shape* needs to change — the mock data
generator (`src/utils/mockData.ts`) was written to produce objects in the
exact shape the real API will return.
