// ---------------------------------------------------------------------------
// Core domain types for RescueHive
// ---------------------------------------------------------------------------

export type Role =
  | "support"
  | "field_operator"
  | "incident_commander"
  | "system_administrator"
  | "developer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  callsign?: string;
}

export type ConnectionHealth = "live" | "degraded" | "stale" | "offline";

export interface Coordinates {
  lat: number;
  lng: number;
}

export type RobotHealth = "nominal" | "warning" | "critical" | "offline";

export type RobotTask =
  | "exploring"
  | "returning_home"
  | "idle"
  | "charging"
  | "manual_control"
  | "e_stopped";

export interface SensorStatus {
  lidar: "ok" | "degraded" | "fault";
  thermal: "ok" | "degraded" | "fault";
  camera: "ok" | "degraded" | "fault";
  gas: "ok" | "degraded" | "fault";
}

export interface Robot {
  id: string;
  name: string;
  callsign: string;
  battery: number; // 0-100
  signal: number; // 0-100
  health: RobotHealth;
  task: RobotTask;
  temperature: number; // celsius
  speed: number; // m/s
  position: Coordinates;
  distanceTravelled: number; // meters
  sensors: SensorStatus;
  lastSeen: string; // ISO timestamp
  connection: ConnectionHealth;
  trail: Coordinates[];
  missionId: string;
}

export type MissionStatus = "planning" | "active" | "paused" | "completed" | "aborted";

export interface Mission {
  id: string;
  name: string;
  status: MissionStatus;
  startedAt: string;
  endedAt?: string;
  areaCoverage: number; // percentage 0-100
  robotsActive: number;
  victimsFound: number;
  hazardsFound: number;
  averageBattery: number;
  connectionHealth: ConnectionHealth;
  location: string;
  searchAreaKm2: number;
}

export type DetectionStatus = "unconfirmed" | "confirmed" | "rejected";
export type Priority = "low" | "medium" | "high" | "critical";

export interface VictimDetection {
  id: string;
  missionId: string;
  robotId: string;
  robotName: string;
  imageUrl: string;
  confidence: number; // 0-100
  position: Coordinates;
  distance: number; // meters from robot
  priority: Priority;
  detectedAt: string;
  status: DetectionStatus;
  notes?: string;
}

export type HazardType =
  | "fire"
  | "gas_leak"
  | "debris"
  | "collapsed_structure"
  | "blocked_path";

export type HazardSeverity = "low" | "moderate" | "severe" | "extreme";

export interface HazardDetection {
  id: string;
  missionId: string;
  type: HazardType;
  severity: HazardSeverity;
  position: Coordinates;
  robotId: string;
  robotName: string;
  imageUrl: string;
  detectedAt: string;
  status: DetectionStatus;
}

export interface TelemetryPoint {
  robotId: string;
  timestamp: string;
  battery: number;
  speed: number;
  temperature: number;
  signal: number;
  position: Coordinates;
}

export interface CameraFeed {
  robotId: string;
  robotName: string;
  streamUrl: string;
  fps: number;
  latencyMs: number;
  isLive: boolean;
  isRecording: boolean;
  hasThermal: boolean;
  hasDepth: boolean;
  lastFrameAt: string;
}

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "mission" | "robot" | "detection" | "hazard" | "system";
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  source: string;
  message: string;
}

export interface SystemHealth {
  apiStatus: "operational" | "degraded" | "down";
  apiLatencyMs: number;
  dbStatus: "operational" | "degraded" | "down";
  wsStatus: "operational" | "degraded" | "down";
  serverLoad: number; // percent
  uptimePercent: number;
}
