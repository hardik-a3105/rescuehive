import type { WsInboundMessage } from "@/types/websocket";
import type { Robot } from "@/types/domain";
import { useRobotStore } from "@/stores/robotStore";
import { useMissionStore } from "@/stores/missionStore";
import { generateVictimDetections, generateHazardDetections } from "@/utils/mockData";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

let tick = 0;

/**
 * Produces one plausible inbound message per invocation, cycling through
 * message kinds the way a real fleet gateway would interleave channels.
 */
export function produceNextMessage(): WsInboundMessage | null {
  tick++;
  const robots = useRobotStore.getState().robots.filter((r) => r.health !== "offline");
  if (robots.length === 0) return null;

  const kindRoll = tick % 5;

  if (kindRoll === 0) {
    // detection event (rare)
    if (Math.random() > 0.55) {
      const robot = robots[Math.floor(Math.random() * robots.length)];
      const isVictim = Math.random() > 0.4;
      if (isVictim) {
        const [victim] = generateVictimDetections(robot.missionId, [robot], 1);
        return { type: "detection", kind: "victim", payload: victim };
      } else {
        const [hazard] = generateHazardDetections(robot.missionId, [robot], 1);
        return { type: "detection", kind: "hazard", payload: hazard };
      }
    }
  }

  if (kindRoll === 1) {
    const mission = useMissionStore.getState().getActiveMission();
    if (mission) {
      return {
        type: "mission_progress",
        missionId: mission.id,
        areaCoverage: clamp(mission.areaCoverage + Math.random() * 1.2, 0, 100),
        robotsActive: robots.length,
        timestamp: new Date().toISOString(),
      };
    }
  }

  if (kindRoll === 2) {
    const robot = robots[Math.floor(Math.random() * robots.length)];
    const nextPos = {
      lat: robot.position.lat + (Math.random() - 0.5) * 0.0015,
      lng: robot.position.lng + (Math.random() - 0.5) * 0.0015,
    };
    return {
      type: "map_update",
      robotId: robot.id,
      position: nextPos,
      trail: [...robot.trail.slice(-24), nextPos],
      timestamp: new Date().toISOString(),
    };
  }

  if (kindRoll === 3) {
    const robot = robots[Math.floor(Math.random() * robots.length)];
    const drain = robot.task === "charging" ? -0.4 : Math.random() * 0.5;
    return {
      type: "telemetry",
      robotId: robot.id,
      timestamp: new Date().toISOString(),
      battery: clamp(robot.battery - drain, 0, 100),
      speed: robot.task === "exploring" ? Number((Math.random() * 1.8).toFixed(2)) : 0,
      temperature: clamp(robot.temperature + (Math.random() - 0.5) * 1.5, 20, 75),
      signal: clamp(robot.signal + (Math.random() - 0.5) * 6, 0, 100),
      position: robot.position,
    };
  }

  // kindRoll === 4: robot_status
  const robot: Robot = robots[Math.floor(Math.random() * robots.length)];
  const health = robot.battery < 15 ? "critical" : robot.battery < 30 ? "warning" : "nominal";
  return {
    type: "robot_status",
    robotId: robot.id,
    health,
    task: robot.task,
    connection: "live",
    timestamp: new Date().toISOString(),
  };
}
