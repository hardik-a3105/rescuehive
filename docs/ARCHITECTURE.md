# RescueHive — Architecture & Phase Roadmap

## 1. Project Overview
RescueHive is an AI-powered Multi-Robot Disaster Intelligence System designed to coordinate autonomous ground/aerial robots, ingest telemetry and computer vision feeds, detect victims and hazards, and present actionable situational intelligence to incident commanders.

## 2. System Boundaries
- **RescueHive Platform (This Repository)**:
  - Command Center UI (React, Tailwind CSS, shadcn/ui, Lucide Icons)
  - Async Platform Core (FastAPI, Pydantic, SQLAlchemy, PostgreSQL)
  - AI Detection Pipeline (Future Phase: YOLO, SAM 2, MiDaS)
  - Mission Coordination & Telemetry Ingestion Engine
- **Webots Multi-Robot Simulator (External)**:
  - Physics simulation world, robot sensors, motor controllers, and environment models.
  - Integration interface: REST & WebSocket streams.

## 3. Phased Roadmap
- **Phase 0: Project Foundation (Current)**
  - Clean monorepo structure.
  - React + Vite + Tailwind CSS + shadcn/ui + Lucide + React Router foundation.
  - FastAPI backend with health check `GET /api/v1/health`.
  - SQLAlchemy PostgreSQL connection layer.
  - Docker & environment configuration.
- **Phase 1: Mission Control UI & Shell**
  - Mission dashboard layout, live feed panels, fleet status widgets, map integration.
- **Phase 2: Database Schema & Authentication**
  - PostgreSQL models: Users, Robots, Missions, Detections, Logs.
  - JWT auth and Role-Based Access Control (RBAC).
- **Phase 3: AI / CV Pipeline Integration**
  - Object detection, segmentation, and monocular depth processing.
- **Phase 4: Simulator WebSocket & Telemetry Ingestion**
  - Bridge to external Webots simulation.
- **Phase 5: Mission Management & Reporting**
  - Live command execution, confirmation workflows, PDF report generation.
