import { create } from "zustand";
import type { HazardDetection, VictimDetection } from "@/types/domain";
import { generateHazardDetections, generateVictimDetections } from "@/utils/mockData";
import { useRobotStore } from "./robotStore";
import { useMissionStore } from "./missionStore";

const robots = useRobotStore.getState().robots;
const missionId = useMissionStore.getState().activeMissionId;

interface DetectionState {
  victims: VictimDetection[];
  hazards: HazardDetection[];
  addVictim: (v: VictimDetection) => void;
  addHazard: (h: HazardDetection) => void;
  confirmVictim: (id: string) => void;
  rejectVictim: (id: string) => void;
  confirmHazard: (id: string) => void;
  rejectHazard: (id: string) => void;
  setVictimNotes: (id: string, notes: string) => void;
}

export const useDetectionStore = create<DetectionState>()((set) => ({
  victims: generateVictimDetections(missionId, robots, 40),
  hazards: generateHazardDetections(missionId, robots, 20),
  addVictim: (v) => set((state) => ({ victims: [v, ...state.victims] })),
  addHazard: (h) => set((state) => ({ hazards: [h, ...state.hazards] })),
  confirmVictim: (id) =>
    set((state) => ({
      victims: state.victims.map((v) => (v.id === id ? { ...v, status: "confirmed" } : v)),
    })),
  rejectVictim: (id) =>
    set((state) => ({
      victims: state.victims.map((v) => (v.id === id ? { ...v, status: "rejected" } : v)),
    })),
  confirmHazard: (id) =>
    set((state) => ({
      hazards: state.hazards.map((h) => (h.id === id ? { ...h, status: "confirmed" } : h)),
    })),
  rejectHazard: (id) =>
    set((state) => ({
      hazards: state.hazards.map((h) => (h.id === id ? { ...h, status: "rejected" } : h)),
    })),
  setVictimNotes: (id, notes) =>
    set((state) => ({
      victims: state.victims.map((v) => (v.id === id ? { ...v, notes } : v)),
    })),
}));
