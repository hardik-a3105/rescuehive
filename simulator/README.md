# Simulator Boundary & Integration Specification

> **IMPORTANT PROJECT BOUNDARY NOTE:**
> Webots simulation is external to this repository and will be integrated through APIs in a later phase.

---

## 1. Boundary & Responsibilities
The **Webots Multi-Robot Simulator** is an external system maintained by another team member.

* **DO NOT** build the Webots simulation in this repository.
* **DO NOT** create robot controllers in this repository.
* **DO NOT** implement SLAM or low-level robot navigation here.

## 2. Planned Integration Interface (Later Phases)
In a subsequent phase, the external simulator will stream telemetry and camera feeds to the RescueHive Platform via standard protocols:

- **WebSocket Ingestion**: Real-time robot vitals, coordinate telemetry `(x, y, z, orientation)`, battery state, and sensor readouts.
- **REST APIs**: Simulator lifecycle triggers (start simulation, stop simulation, reset world, spawn robot).
- **Video Feeds**: RTSP/WebRTC or HTTP multipart streams from onboard robot cameras dispatched directly to the AI vision pipeline.

## 3. Current Phase Status
As of **Phase 0 (Project Foundation)**, this directory serves as an architectural placeholder and documentation boundary.
No mock simulator or Webots code is implemented in this phase.
