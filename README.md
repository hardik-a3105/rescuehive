# RescueHive — Disaster Intelligence Command Center

A production-structured frontend for an AI-powered multi-robot disaster response
platform, built to feel like real mission-control software (NASA Mission Control /
SpaceX / air-traffic-control aesthetic — not a typical admin dashboard).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. Log in with any of the demo accounts on the login
screen (password for all: `demo1234`). Each account demonstrates a different
role-based dashboard experience:

| Role | Email | Lands on |
|---|---|---|
| Incident Commander | commander@rescuehive.io | Dashboard (full picture) |
| Field Operator | operator@rescuehive.io | Live Mission (focused UI) |
| System Administrator | admin@rescuehive.io | Admin Panel |
| Developer | dev@rescuehive.io | System Health / logs |
| Support | support@rescuehive.io | Dashboard (read-focused) |

## What's real vs. simulated

Everything in this app runs against **mock data and a simulated WebSocket** —
there is no backend required to explore the full UI. The simulation layer is
built so it's a drop-in replacement:

- `src/services/websocket/mockSocket.ts` — mimics a real `WebSocket`'s
  connect / message / reconnect lifecycle. Swap this for a real socket
  connecting to `VITE_WS_URL` and nothing downstream changes.
- `src/services/websocket/messageProducer.ts` — generates plausible
  `telemetry` / `robot_status` / `map_update` / `detection` / `mission_progress`
  events on an interval, matching the backend contract in the spec.
- `src/services/websocket/dispatch.ts` — the "Message Parser" layer: routes
  each inbound message type to the right Zustand store slice.
- `src/services/api/*` — Axios-based REST calls whose function signatures
  already match the FastAPI endpoints (`/auth/login`, `/missions/{id}/start`,
  etc.). Bodies currently resolve against local state; swap in `apiClient`
  calls to point at a real backend.

Set `VITE_API_BASE_URL` / `VITE_WS_URL` in a `.env` (see `.env.example`) once
a backend is available.

## Architecture

```
WebSocket (mock or real)
   -> messageProducer / real socket frames
   -> dispatch.ts (message parser)
   -> Zustand stores (robotStore, detectionStore, missionStore, notificationStore)
   -> React components (subscribed to only the slices they need)
```

Feature-based folder structure under `src/features/*` — each feature owns its
pages and feature-specific components. Shared UI primitives live in
`src/components/ui`, cross-feature components in `src/components/common`.

## Key product decisions worth knowing about

- **Human-in-the-loop confirmation**: victim/hazard detections are never
  visually presented as confirmed until a person accepts them (see
  `detectionStore.ts` — `status` starts as `unconfirmed`).
- **AI Report page** always displays "AI Generated Recommendation — For Human
  Review Only" per the spec.
- **Accessibility**: status is never conveyed by color alone — badges pair
  color with icon + text label (see `HealthBadge`, `ConnectionDot`).
- **Role-based dashboards** are genuinely different views (not just hidden
  buttons) — Field Operator lands on a focused Mission page; Incident
  Commander gets the full dashboard; Admin/Developer get operational tooling.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check and production build
- `npm run lint` — ESLint
- `npm run preview` — preview the production build locally

## Extending

This scaffold covers the full navigation surface described in the product
spec. A few areas are intentionally left as clearly-marked placeholders ready
for follow-up work: mission replay (Mission Details → Replay tab), thermal/
depth camera streams (currently static placeholders per feed), and real push
notifications (currently simulated via the WebSocket layer). Search
`TODO`-style comments and the "Replay unavailable" state as starting points.
