# RescueHive — AI-Powered Multi-Robot Disaster Intelligence System

## 1. Project Purpose
RescueHive is a next-generation disaster intelligence and mission command platform designed for search and rescue operations. It empowers incident commanders and field teams with real-time fleet telemetry, AI-assisted victim and hazard detection, and rapid multi-robot mission coordination during catastrophic events.

> **CRITICAL BOUNDARY NOTICE:**  
> **Webots simulation is external to this repository and will be integrated through APIs in a later phase.**

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 / 19 with Vite
- **Styling**: Tailwind CSS & shadcn/ui design conventions
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6 / v7)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **ORM & DB**: SQLAlchemy 2.0 with PostgreSQL (`psycopg2-binary`)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Configuration**: Environment variables (`.env`)

---

## 3. Project Architecture

```
                          ┌────────────────────────┐
                          │   RescueHive Frontend   │
                          │   (React + Vite + UI)  │
                          └───────────┬────────────┘
                                      │
                            REST & WebSocket APIs
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │    FastAPI Backend     │
                          │  (Auth, DB, Telemetry) │
                          └─────┬────────────┬─────┘
                                │            │
                 PostgreSQL DB ─┘            └── AI / CV Pipeline
           (SQLAlchemy Engine)                    (Future Phase)
                                                     │
                                                     ▼
                                      ┌────────────────────────┐
                                      │ External Webots Sim    │
                                      │ (External Team Member) │
                                      └────────────────────────┘
```

---

## 4. Folder Structure

```
rescuehive/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI elements (shadcn/ui style)
│   │   ├── pages/            # View pages and routing targets
│   │   ├── layouts/          # Application shell & header layouts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API clients and data fetchers
│   │   ├── types/            # Domain interfaces and type helpers
│   │   ├── utils/            # General helpers and className utilities
│   │   ├── mock/             # Mock structures for development
│   │   ├── App.jsx           # Root application with router
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Dependencies & scripts
│   ├── vite.config.js        # Vite build & proxy configuration
│   ├── tailwind.config.js    # Tailwind theme configuration
│   └── postcss.config.js     # PostCSS setup
│
├── backend/                  # FastAPI async backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/           # API v1 route definitions & health endpoints
│   │   ├── core/             # Configuration & application settings
│   │   ├── models/           # SQLAlchemy declarative database models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic layer
│   │   ├── db/               # PostgreSQL engine, session, and base definitions
│   │   ├── websocket/        # Real-time WebSocket connection manager
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Container definition
│   └── .env.example          # Backend environment template
│
├── ai/                       # AI & Computer Vision module placeholders
│   ├── detection/            # Object detection (e.g., YOLO)
│   ├── segmentation/         # Image segmentation (e.g., SAM 2)
│   ├── depth/                # Depth estimation (e.g., MiDaS)
│   └── models/               # Model weights storage
│
├── simulator/                # Simulator documentation & integration boundary
│   └── README.md             # Integration protocols & team boundary
│
├── docs/                     # Architecture & roadmap documentation
│   └── ARCHITECTURE.md
│
├── .env.example              # Global environment configuration template
├── .gitignore                # Comprehensive Git ignore specifications
├── docker-compose.yml        # Multi-container orchestration
└── README.md                 # Project documentation
```

---

## 5. Current Phase

**Phase 0: Project Foundation**  
- Clean, scalable monorepo setup
- React + Vite + Tailwind CSS shell setup
- FastAPI backend baseline with health check endpoint (`GET /api/v1/health`)
- SQLAlchemy PostgreSQL connection layer
- Simulator integration boundary documentation

---

## 6. Future Phases

- **Phase 1: Mission Control UI & Shell** — Complete dashboard interface, mission telemetry panels, interactive map.
- **Phase 2: Database Schema & Authentication** — Full PostgreSQL models (Users, Robots, Missions, Detections) and JWT auth.
- **Phase 3: AI / CV Pipeline Integration** — YOLO victim/hazard detection, segmentation, and depth inference.
- **Phase 4: Simulator WebSocket & Telemetry Ingestion** — Live bidirectional bridge to the external Webots simulation.
- **Phase 5: Mission Management & Reporting** — Live command execution, confirmation workflows, PDF report generation.

---

## 7. How to Run Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.11+)
- Docker (optional, for containerized PostgreSQL)

### Backend Setup
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
5. Start the backend:
   ```bash
   uvicorn app.main:app --reload
   ```
6. Verify the health endpoint at:
   - URL: `http://localhost:8000/api/v1/health`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

### Frontend Setup
1. Open another terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.
