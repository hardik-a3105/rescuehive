import type {
  AppNotification,
  CameraFeed,
  HazardDetection,
  HazardType,
  LogEntry,
  Mission,
  Robot,
  RobotHealth,
  RobotTask,
  SystemHealth,
  User,
  VictimDetection,
} from "@/types/domain";

// Base operating area — a fictional disaster zone (used consistently across map/mock data)
export const BASE_CENTER = { lat: 34.0522, lng: -118.2437 };

let seedCounter = 1;
function nextId(prefix: string) {
  return `${prefix}-${String(seedCounter++).padStart(4, "0")}`;
}

function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(randBetween(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function jitterCoord(center: { lat: number; lng: number }, radiusKm = 1.2) {
  const radiusInDeg = radiusKm / 111;
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * radiusInDeg;
  return {
    lat: center.lat + r * Math.cos(angle),
    lng: center.lng + r * Math.sin(angle),
  };
}

function isoMinutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

// --------------------------------------------------------------------------
// Users
// --------------------------------------------------------------------------

export const MOCK_USERS: Record<string, User & { password: string }> = {
  "commander@rescuehive.io": {
    id: "usr-1001",
    name: "Elena Vargas",
    email: "commander@rescuehive.io",
    role: "incident_commander",
    callsign: "COMMAND-1",
    password: "demo1234",
  },
  "operator@rescuehive.io": {
    id: "usr-1002",
    name: "Marcus Reyes",
    email: "operator@rescuehive.io",
    role: "field_operator",
    callsign: "FIELD-4",
    password: "demo1234",
  },
  "admin@rescuehive.io": {
    id: "usr-1003",
    name: "Priya Nandan",
    email: "admin@rescuehive.io",
    role: "system_administrator",
    callsign: "ADMIN-1",
    password: "demo1234",
  },
  "dev@rescuehive.io": {
    id: "usr-1004",
    name: "Sam Okafor",
    email: "dev@rescuehive.io",
    role: "developer",
    callsign: "DEV-1",
    password: "demo1234",
  },
  "support@rescuehive.io": {
    id: "usr-1005",
    name: "Jamie Lin",
    email: "support@rescuehive.io",
    role: "support",
    callsign: "SUPPORT-1",
    password: "demo1234",
  },
};

// --------------------------------------------------------------------------
// Missions
// --------------------------------------------------------------------------

const missionNames = [
  "Operation Firebreak",
  "Cascade Ridge Collapse",
  "Harborview Flood Response",
  "Sector 7 Structural Search",
  "Northgate Earthquake Response",
];

export function generateMissions(count = 5): Mission[] {
  return Array.from({ length: count }).map((_, i) => {
    const status = i === 0 ? "active" : pick<Mission["status"]>(["active", "paused", "completed", "completed"]);
    return {
      id: nextId("mission"),
      name: missionNames[i % missionNames.length],
      status,
      startedAt: isoMinutesAgo(randInt(30, 4000)),
      endedAt: status === "completed" ? isoMinutesAgo(randInt(1, 29)) : undefined,
      areaCoverage: randInt(12, 96),
      robotsActive: randInt(2, 10),
      victimsFound: randInt(0, 12),
      hazardsFound: randInt(0, 8),
      averageBattery: randInt(35, 92),
      connectionHealth: pick(["live", "degraded", "live", "live"]),
      location: pick(["Cascade Ridge, Sector B", "Harborview District", "Northgate Industrial Zone", "Downtown Core"]),
      searchAreaKm2: Number(randBetween(0.5, 6).toFixed(1)),
    };
  });
}

// --------------------------------------------------------------------------
// Robots
// --------------------------------------------------------------------------

const robotModelNames = [
  "Scout",
  "Pathfinder",
  "Sentinel",
  "Ranger",
  "Vanguard",
  "Recon",
  "Atlas",
  "Falcon",
  "Nomad",
  "Cipher",
];

function randomTrail(center: { lat: number; lng: number }, points = 12) {
  const trail = [];
  let cursor = { ...center };
  for (let i = 0; i < points; i++) {
    cursor = jitterCoord(cursor, 0.06);
    trail.push(cursor);
  }
  return trail;
}

export function generateRobots(missionId: string, count = 10): Robot[] {
  return Array.from({ length: count }).map((_, i) => {
    const health: RobotHealth = pick(["nominal", "nominal", "nominal", "warning", "critical", "offline"]);
    const task: RobotTask =
      health === "offline"
        ? "idle"
        : pick(["exploring", "exploring", "returning_home", "idle", "charging"]);
    const position = jitterCoord(BASE_CENTER);
    const okOrFault = () => pick<"ok" | "degraded" | "fault">(["ok", "ok", "ok", "degraded", "fault"]);

    return {
      id: nextId("robot"),
      name: `${robotModelNames[i % robotModelNames.length]}-${randInt(10, 99)}`,
      callsign: `RH-${String(i + 1).padStart(2, "0")}`,
      battery: health === "offline" ? randInt(0, 15) : randInt(18, 100),
      signal: health === "offline" ? 0 : randInt(40, 100),
      health,
      task,
      temperature: Number(randBetween(28, 61).toFixed(1)),
      speed: task === "exploring" ? Number(randBetween(0.2, 1.8).toFixed(2)) : 0,
      position,
      distanceTravelled: randInt(120, 4800),
      sensors: {
        lidar: okOrFault(),
        thermal: okOrFault(),
        camera: okOrFault(),
        gas: okOrFault(),
      },
      lastSeen: health === "offline" ? isoMinutesAgo(randInt(5, 90)) : isoMinutesAgo(randInt(0, 2)),
      connection: health === "offline" ? "offline" : pick(["live", "live", "live", "degraded"]),
      trail: randomTrail(position),
      missionId,
    };
  });
}

// --------------------------------------------------------------------------
// Detections
// --------------------------------------------------------------------------

export function generateVictimDetections(missionId: string, robots: Robot[], count = 40): VictimDetection[] {
  return Array.from({ length: count }).map(() => {
    const robot = pick(robots);
    return {
      id: nextId("victim"),
      missionId,
      robotId: robot.id,
      robotName: robot.name,
      imageUrl: `https://picsum.photos/seed/${nextId("img")}/480/320`,
      confidence: randInt(52, 99),
      position: jitterCoord(robot.position, 0.15),
      distance: randInt(2, 45),
      priority: pick<VictimDetection["priority"]>(["low", "medium", "high", "critical"]),
      detectedAt: isoMinutesAgo(randInt(0, 600)),
      status: pick<VictimDetection["status"]>(["unconfirmed", "unconfirmed", "confirmed", "rejected"]),
    };
  });
}

const hazardTypes: HazardType[] = ["fire", "gas_leak", "debris", "collapsed_structure", "blocked_path"];

export function generateHazardDetections(missionId: string, robots: Robot[], count = 20): HazardDetection[] {
  return Array.from({ length: count }).map(() => {
    const robot = pick(robots);
    return {
      id: nextId("hazard"),
      missionId,
      type: pick(hazardTypes),
      severity: pick<HazardDetection["severity"]>(["low", "moderate", "severe", "extreme"]),
      position: jitterCoord(robot.position, 0.18),
      robotId: robot.id,
      robotName: robot.name,
      imageUrl: `https://picsum.photos/seed/${nextId("hazimg")}/480/320`,
      detectedAt: isoMinutesAgo(randInt(0, 600)),
      status: pick<HazardDetection["status"]>(["unconfirmed", "confirmed", "confirmed"]),
    };
  });
}

// --------------------------------------------------------------------------
// Camera feeds
// --------------------------------------------------------------------------

export function generateCameraFeeds(robots: Robot[]): CameraFeed[] {
  return robots
    .filter((r) => r.health !== "offline")
    .map((r) => ({
      robotId: r.id,
      robotName: r.name,
      streamUrl: `https://picsum.photos/seed/${r.id}-cam/640/360`,
      fps: randInt(18, 30),
      latencyMs: randInt(80, 340),
      isLive: r.connection === "live",
      isRecording: Math.random() > 0.6,
      hasThermal: Math.random() > 0.4,
      hasDepth: Math.random() > 0.5,
      lastFrameAt: isoMinutesAgo(0),
    }));
}

// --------------------------------------------------------------------------
// Logs
// --------------------------------------------------------------------------

const logSources = ["ws-gateway", "mission-planner", "robot-fleet", "auth-service", "detection-pipeline", "api-gateway"];
const logMessages = [
  "Heartbeat received",
  "Reconnect attempt succeeded",
  "Telemetry batch processed",
  "Detection confidence below threshold, discarded",
  "Mission checkpoint saved",
  "Robot registered to fleet",
  "WebSocket connection dropped, retrying",
  "Battery threshold alert dispatched",
  "Route replanned due to obstacle",
  "Image upload completed",
];

export function generateLogs(count = 200): LogEntry[] {
  return Array.from({ length: count })
    .map(() => ({
      id: nextId("log"),
      timestamp: isoMinutesAgo(randInt(0, 2000)),
      level: pick<LogEntry["level"]>(["info", "info", "info", "debug", "warn", "error"]),
      source: pick(logSources),
      message: pick(logMessages),
    }))
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

export function generateNotifications(count = 12): AppNotification[] {
  const templates: Array<[AppNotification["severity"], AppNotification["category"], string, string]> = [
    ["critical", "detection", "Victim detected", "High-confidence victim detection requires review"],
    ["warning", "robot", "Battery low", "Robot battery has dropped below 20%"],
    ["critical", "hazard", "Hazard detected", "Fire hazard detected in search sector"],
    ["info", "mission", "Mission checkpoint", "Area coverage has reached a new milestone"],
    ["success", "mission", "Mission complete", "Search mission has been completed successfully"],
    ["warning", "robot", "Robot offline", "Connection to robot has been lost"],
    ["info", "system", "System update", "Fleet firmware update available"],
  ];
  return Array.from({ length: count }).map(() => {
    const [severity, category, title, message] = pick(templates);
    return {
      id: nextId("notif"),
      severity,
      title,
      message,
      timestamp: isoMinutesAgo(randInt(0, 400)),
      read: Math.random() > 0.5,
      category,
    };
  });
}

// --------------------------------------------------------------------------
// System health
// --------------------------------------------------------------------------

export function generateSystemHealth(): SystemHealth {
  return {
    apiStatus: "operational",
    apiLatencyMs: randInt(40, 180),
    dbStatus: "operational",
    wsStatus: "operational",
    serverLoad: randInt(20, 70),
    uptimePercent: Number(randBetween(99.4, 99.99).toFixed(2)),
  };
}
