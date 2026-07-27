import type { WsInboundMessage } from "@/types/websocket";
import { useRobotStore } from "@/stores/robotStore";
import { useDetectionStore } from "@/stores/detectionStore";
import { useMissionStore } from "@/stores/missionStore";
import { useNotificationStore } from "@/stores/notificationStore";
import type { VictimDetection, HazardDetection } from "@/types/domain";

/**
 * Message Parser layer: WebSocket -> Message Parser -> Zustand Store -> React Components.
 * Each handler performs a targeted, shallow store update so only the components
 * subscribed to that slice re-render (no broad re-renders on unrelated state).
 */
export function dispatchWsMessage(msg: WsInboundMessage) {
  switch (msg.type) {
    case "telemetry": {
      useRobotStore.getState().applyTelemetry(msg.robotId, {
        battery: msg.battery,
        speed: msg.speed,
        temperature: msg.temperature,
        signal: msg.signal,
        lastSeen: msg.timestamp,
      });
      if (msg.battery < 15) {
        useNotificationStore.getState().push({
          id: `notif-batt-${msg.robotId}-${Date.now()}`,
          severity: "warning",
          title: "Battery low",
          message: `${msg.robotId} battery has dropped below 15%`,
          timestamp: msg.timestamp,
          read: false,
          category: "robot",
        });
      }
      break;
    }
    case "robot_status": {
      useRobotStore.getState().applyTelemetry(msg.robotId, {
        health: msg.health,
        task: msg.task,
        connection: msg.connection,
      });
      break;
    }
    case "map_update": {
      useRobotStore.getState().applyTelemetry(msg.robotId, {
        position: msg.position,
        trail: msg.trail,
      });
      break;
    }
    case "mission_progress": {
      useMissionStore
        .getState()
        .updateMissionProgress(msg.missionId, msg.areaCoverage, msg.robotsActive);
      break;
    }
    case "detection": {
      if (msg.kind === "victim") {
        const victim = msg.payload as VictimDetection;
        useDetectionStore.getState().addVictim(victim);
        useNotificationStore.getState().push({
          id: `notif-victim-${victim.id}`,
          severity: "critical",
          title: "Victim detected",
          message: `${victim.robotName} reported a possible victim (${victim.confidence}% confidence)`,
          timestamp: victim.detectedAt,
          read: false,
          category: "detection",
        });
      } else {
        const hazard = msg.payload as HazardDetection;
        useDetectionStore.getState().addHazard(hazard);
        useNotificationStore.getState().push({
          id: `notif-hazard-${hazard.id}`,
          severity: "critical",
          title: "Hazard detected",
          message: `${hazard.robotName} reported a ${hazard.type.replace("_", " ")} hazard`,
          timestamp: hazard.detectedAt,
          read: false,
          category: "hazard",
        });
      }
      break;
    }
  }
}
