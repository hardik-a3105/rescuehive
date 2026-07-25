import type { Coordinates, HazardDetection, RobotHealth, RobotTask, VictimDetection } from "./domain";

// Discriminated union describing every inbound WS message.
// Matches backend channels: telemetry, robot_status, map_update, detection, mission_progress

export interface TelemetryMessage {
  type: "telemetry";
  robotId: string;
  timestamp: string;
  battery: number;
  speed: number;
  temperature: number;
  signal: number;
  position: Coordinates;
}

export interface RobotStatusMessage {
  type: "robot_status";
  robotId: string;
  health: RobotHealth;
  task: RobotTask;
  connection: "live" | "degraded" | "stale" | "offline";
  timestamp: string;
}

export interface MapUpdateMessage {
  type: "map_update";
  robotId: string;
  position: Coordinates;
  trail: Coordinates[];
  timestamp: string;
}

export interface DetectionMessage {
  type: "detection";
  kind: "victim" | "hazard";
  payload: VictimDetection | HazardDetection;
}

export interface MissionProgressMessage {
  type: "mission_progress";
  missionId: string;
  areaCoverage: number;
  robotsActive: number;
  timestamp: string;
}

export type WsInboundMessage =
  | TelemetryMessage
  | RobotStatusMessage
  | MapUpdateMessage
  | DetectionMessage
  | MissionProgressMessage;

export type WsConnectionState = "connecting" | "open" | "reconnecting" | "closed";
