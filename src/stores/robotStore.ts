import { create } from "zustand";
import type { Robot } from "@/types/domain";
import { generateRobots } from "@/utils/mockData";
import { useMissionStore } from "./missionStore";

const initialRobots = generateRobots(useMissionStore.getState().activeMissionId, 10);

interface RobotState {
  robots: Robot[];
  selectedRobotId: string | null;
  selectRobot: (id: string | null) => void;
  applyTelemetry: (robotId: string, patch: Partial<Robot>) => void;
  emergencyStop: (robotId: string) => void;
  returnHome: (robotId: string) => void;
  toggleTrail: (robotId: string) => void;
  trailVisibility: Record<string, boolean>;
}

export const useRobotStore = create<RobotState>()((set) => ({
  robots: initialRobots,
  selectedRobotId: null,
  trailVisibility: {},
  selectRobot: (id) => set({ selectedRobotId: id }),
  applyTelemetry: (robotId, patch) =>
    set((state) => ({
      robots: state.robots.map((r) => (r.id === robotId ? { ...r, ...patch } : r)),
    })),
  emergencyStop: (robotId) =>
    set((state) => ({
      robots: state.robots.map((r) =>
        r.id === robotId ? { ...r, task: "e_stopped", speed: 0 } : r
      ),
    })),
  returnHome: (robotId) =>
    set((state) => ({
      robots: state.robots.map((r) => (r.id === robotId ? { ...r, task: "returning_home" } : r)),
    })),
  toggleTrail: (robotId) =>
    set((state) => ({
      trailVisibility: { ...state.trailVisibility, [robotId]: !state.trailVisibility[robotId] },
    })),
}));
