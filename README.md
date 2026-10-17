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

## 3. System Architecture

RescueHive is structured as a decoupled, multi-tier disaster command and intelligence system built for high reliability, local-first execution, and real-time operational awareness.

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION & COMMAND LAYER                          │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                     RescueHive React 18 + Vite SPA                      │   │
│   │                                                                         │   │
│   │   [Tactical Map / GIS]   [Fleet Status Cards]   [AI Detections Queue]   │   │
│   │   [Mission Objectives]   [Printable AI Reports] [Workstation Settings]  │   │
│   │                                                                         │   │
│   │   State:  AuthContext  │  MissionContext  │  SettingsContext (Theme/UI) │   │
│   │   Shell:  Stationary Desktop Sidebar (100vh)  │  Mobile Responsive Bar  │   │
│   └────────────────────────────────────┬────────────────────────────────────┘   │
└────────────────────────────────────────┼────────────────────────────────────────┘
                                         │
                               REST HTTP │ & WebSocket
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND APPLICATION LAYER (FastAPI)                      │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                      FastAPI Async Gateway (ASGI)                       │   │
│   │                                                                         │   │
│   │   /api/v1/auth        - JWT Authentication & RBAC (Commander / Operator)│   │
│   │   /api/v1/missions    - Mission Lifecycle & Tactical Objectives         │   │
│   │   /api/v1/robots      - Swarm Fleet Registry & Hardware Status          │   │
│   │   /api/v1/detections  - AI Detections Triage & Human Review Queue       │   │
│   │   /api/v1/ai          - Multimodal Vision Analysis Engine               │   │
│   │   /api/v1/ws          - Real-Time Bidirectional Telemetry Streams       │   │
│   │                                                                         │   │
│   │   Services:  MissionService │ RobotService │ DetectionService           │   │
│   │              VisionAnalysisService │ WebSocketConnectionManager         │   │
│   └─────────────────────┬─────────────────────────────┬─────────────────────┘   │
└─────────────────────────┼─────────────────────────────┼─────────────────────────┘
                          │                             │
                          │ SQL (SQLAlchemy 2.0)        │ HTTP REST (Port 11434)
                          ▼                             ▼
┌───────────────────────────────────┐         ┌───────────────────────────────────┐
│      DATA PERSISTENCE LAYER       │         │   LOCAL VISION AI ENGINE (OLLAMA) │
│                                   │         │                                   │
│   PostgreSQL Relational Database  │         │   Local Ollama Daemon (Host/GPU)  │
│                                   │         │                                   │
│   - Users & Auth Credentials      │         │   Model: Gemma 3 4B (Vision LLM)  │
│   - Swarm Robots & Hardware State │         │   - Zero cloud API dependency     │
│   - Missions & Spatial Boundaries │         │   - Multimodal prompt engineering │
│   - High-Frequency Telemetry Logs │         │   - Structured JSON scene parsing │
│   - AI Detections & Confirmations │         │   - Triage of victims & hazards   │
│   - Alembic Versioned Migrations  │         │   - Human-in-the-loop review flow │
└───────────────────────────────────┘         └───────────────────────────────────┘
                                                        ▲
                                                        │ Camera Frames / Sensor Feeds
                                                        │
                                      ┌─────────────────┴─────────────────┐
                                      │   EXTERNAL SIMULATION & ROBOTICS  │
                                      │                                   │
                                      │   Webots Multi-Robot Simulator    │
                                      │   (External Team Boundary)        │
                                      │   - Aerial Drones (UAVs)          │
                                      │   - Ground Rovers (UGVs)          │
                                      │   - Synthesized LiDAR & GPS       │
                                      └───────────────────────────────────┘
```

### 3.2 Architectural Layers & Responsibilities

1. **Presentation & Command Layer (Frontend)**:
   - Built with **React 18**, **Vite**, and **Tailwind CSS**.
   - **Stationary Viewport Shell**: Pinned desktop sidebar (`100vh`) with independent content scrolling; responsive collapsible drawer for field tablets and mobile screens.
   - **Unified State Management**: Four reactive contexts (`AuthContext`, `MissionContext`, `SettingsContext`, `ThemeContext`) coordinating live telemetry, user sessions, active missions, and workstation display preferences.
   - **Tactical Field Flexibility**:
     - Instant dark/light theme switching with `localStorage` persistence.
     - Universal dynamic metric/imperial unit conversion (`m²` ⇄ `sq ft`, `m/s` ⇄ `mph`, `°C` ⇄ `°F`).
     - Web Audio API acoustic chimes for critical alerts.
     - `@media print` stylesheets formatting mission debriefs into browser-native PDFs with human verification advisory banners.

2. **API & Communication Gateway (FastAPI Backend)**:
   - High-performance asynchronous REST API powered by **Uvicorn** and **Pydantic v2**.
   - **Role-Based Access Control (RBAC)**: Secure JWT authentication enforcing least privilege (Incident Commander vs Field Operator).
   - **WebSocket Connection Manager**: Low-latency bidirectional broadcasting for swarm telemetry, waypoint navigation, and emergency abort signals.
   - **Modular Service Layer**: Decoupled domain services (`MissionService`, `DetectionService`, `RobotService`, `VisionAnalysisService`) handling business validation and database transactions.

3. **Local AI & Multimodal Vision Intelligence**:
   - **Local-First Deployment**: Runs locally via **Ollama** (`gemma3:4b`), requiring zero external internet access or proprietary third-party cloud APIs — critical for air-gapped disaster operations.
   - **Scene Understanding**: Ingests disaster imagery up to 10MB, extracting structured JSON summaries, casualty triage classifications, hazard alerts (fire, debris, gas leaks), and qualitative confidence assessments.
   - **Human-in-the-Loop Protocol**: All automated detections enter an initial `PENDING` state and require operator verification (`CONFIRMED` or `DISMISSED`), safeguarding against hallucinations.

4. **Data Persistence Layer (PostgreSQL & SQLAlchemy)**:
   - Relational database schema with declarative models managed via **SQLAlchemy 2.0**.
   - Database migrations tracked and versioned using **Alembic**.
   - Containerized deployment through Docker Compose for consistent local development and staging environments.

5. **External Simulator Boundary**:
   - Clean API boundary separating the command intelligence platform from the **Webots** robotics physics simulation.
   - External simulator nodes ingest mission waypoints and emit simulated hardware telemetry (battery %, GPS coordinates, motor health, and camera captures) over standardized REST/WebSocket contracts.

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

## 5. System Features & Current Status

### ✅ Implemented Features
1. **Disaster Command Operations (Frontend)**:
   - **Tactical Dashboard**: Fleet status overview, active mission telemetry, interactive tactical map, and real-time alerts.
   - **Fixed Sidebar & Responsive Shell**: Stationary desktop sidebar (`100vh`) with independent content scrolling; responsive mobile drawer with hamburger toggle.
   - **Light & Dark Theme Engine**: High-contrast tactical dark mode paired with a functional light mode, with instant persistence in `localStorage`.
   - **Workstation System Settings**:
     - Operator callsign, name, and agency profile editing with dirty-state indicator (`● UNSAVED CHANGES`).
     - Real-time polling rate options (5s, 8s, 15s, 30s) wired into global API state.
     - Universal Metric (`m²`, `m/s`, `°C`) and Imperial (`sq ft`, `mph`, `°F`) measurement unit conversion across all views.
     - Web Audio API tactical sound alerts with pitch frequency warnings and chime previews.
     - Field-optimized compact dashboard layout density mode.
   - **AI Debrief Reports**:
     - Live compilation of PostgreSQL mission data (elapsed duration, surveyed area, casualty triage counts, hazard logs).
     - Filterable by mission, status (`ACTIVE`, `COMPLETED`, `PAUSED`), and date horizon (`24h`, `7d`, `30d`, `All`).
     - Browser-native "Print / Export PDF" with dedicated `@media print` stylesheets.
     - Prominent AI advisory disclaimers mandating human-in-the-loop verification before field execution.
   - **Fleet & Mission Management**:
     - Dynamic fleet cards and table with collapsible telemetry.
     - Mission creation, status controls (`START`, `PAUSE`, `ABORT`), and live objective checklists.

2. **Backend & AI Architecture (FastAPI & Ollama)**:
   - **Relational PostgreSQL Database**: SQLAlchemy 2.0 models for Users, Robots, Missions, Telemetry, and Detections.
   - **JWT Authentication & RBAC**: Role-based access control distinguishing incident commanders from field operators.
   - **Local Vision Intelligence (Gemma 3 4B)**:
     - GPU-accelerated multimodal scene understanding via local Ollama daemon.
     - Automated detection of victims, fire, debris, and structural hazards with qualitative confidence indicators.
     - Human-in-the-loop confirmation / dismissal queue syncing back to PostgreSQL.

---

## 6. External Boundary & Roadmap

- **External Webots Simulation**: Webots physics and hardware simulation operate as an external boundary to this repository and connect via API/WebSocket ingestion endpoints.
- **Future Enhancements**:
  - Edge-device live RTSP/WebRTC camera streaming.
  - Pixel-calibrated bounding box overlays with YOLOv11 and depth estimation (MiDaS).
  - Multi-agent decentralized consensus for autonomous swarm routing.

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

---

## 8. Phase 4A — Local Ollama Vision LLM Setup & Usage

RescueHive integrates a local vision-capable LLM (**Gemma 3 4B**) through **Ollama** for automated disaster-scene analysis and human-in-the-loop review.

### Prerequisites
- [Ollama](https://ollama.com/download) installed locally on Windows.
- NVIDIA GPU with CUDA acceleration recommended (e.g. RTX 3050 Laptop GPU or higher).

### 1. Check whether Ollama is Running
In Windows PowerShell:
```powershell
# Check if Ollama CLI is responsive
ollama list

# If Ollama serve is not running, start it:
ollama serve
```

### 2. Pull the Vision Model
To download Gemma 3 4B (3.4 GB vision-capable model):
```powershell
# Pull model
ollama pull gemma3:4b

# Verify capabilities interactively
ollama run gemma3:4b "Explain your capabilities for image analysis."
```
*Note: To store models on secondary storage (e.g. D: drive), configure `[System.Environment]::SetEnvironmentVariable('OLLAMA_MODELS', 'D:\ollama\models', 'User')` before starting `ollama serve`.*

### 3. Environment Variables
Add or verify settings in `backend/.env`:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=gemma3:4b
AI_ANALYSIS_TIMEOUT_SECONDS=120
MAX_UPLOAD_SIZE_MB=10
```

### 4. Running the Full System
1. **Start Backend**:
   ```powershell
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --reload
   ```
2. **Start Frontend**:
   ```powershell
   cd frontend
   npm run dev
   ```

### 5. How to Upload a Test Image
1. Navigate to **AI Detections Queue** in the sidebar: `http://localhost:5173/detections`.
2. Observe the **Local Ollama Vision Intelligence** card at the top of the page. The status badge will show `Ollama Engine Ready (GPU)`.
3. Drag & drop or browse a disaster-scene photo (`.jpg`, `.png`, or `.webp`, up to 10MB).
4. Optionally associate with an active mission context.
5. Click **Run AI Scene Analysis**.
6. The system displays a progress scanner while Gemma 3 processes multimodal features, generates a structured scene summary, and extracts visible emergency targets (victims, fire, debris, gas cylinders, helmets, backpacks).

### 6. Reviewing and Confirming Saved Detections
1. Findings are automatically persisted in PostgreSQL with initial status `PENDING`.
2. Scroll to the **AI Detections Queue** table below.
3. Findings from manual upload display source pill `OLLAMA VISION` and an explicit `uncalibrated est.` confidence indicator.
4. Click the **Inspect (Eye)** icon to view the photographic frame, visual evidence notes, and scene diagnostic summary.
5. Click **Confirm (Checkmark)** to verify the detection, or **Dismiss (X)** to discard a false positive. Both actions persist status changes directly through FastAPI into PostgreSQL.

### 7. Known Model Limitations
- **Qualitative Interpretation vs Object Detection**: Gemma 3 4B is a vision-language model, not a calibrated object detector (such as YOLO). Confidence scores are qualitative model estimates and not statistically calibrated probabilities.
- **No Calibrated Bounding Boxes**: Spatial locations are approximate regional descriptions (e.g., "lower-left", "center foreground") rather than pixel-precise bounding boxes.
- **Human-in-the-Loop Requirement**: Operators must verify findings before marking detections as `CONFIRMED`.
- **Lighting and Smoke**: Dense obscuration, extreme smoke, or pitch-black darkness reduce multimodal visual acuity.
