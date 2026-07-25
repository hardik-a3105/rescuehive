import { create } from "zustand";
import type { Mission } from "@/types/domain";
import { generateMissions } from "@/utils/mockData";

const missions = generateMissions(5);

interface MissionState {
  missions: Mission[];
  activeMissionId: string;
  setActiveMission: (id: string) => void;
  updateMissionProgress: (missionId: string, areaCoverage: number, robotsActive: number) => void;
  getActiveMission: () => Mission | undefined;
}

export const useMissionStore = create<MissionState>()((set, get) => ({
  missions,
  activeMissionId: missions.find((m) => m.status === "active")?.id ?? missions[0].id,
  setActiveMission: (id) => set({ activeMissionId: id }),
  updateMissionProgress: (missionId, areaCoverage, robotsActive) =>
    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === missionId ? { ...m, areaCoverage, robotsActive } : m
      ),
    })),
  getActiveMission: () => get().missions.find((m) => m.id === get().activeMissionId),
}));
