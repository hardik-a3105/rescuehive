import { useMissionStore } from "@/stores/missionStore";
import type { Mission } from "@/types/domain";

// NOTE: These functions currently resolve against the local mock store to
// keep the app fully interactive without a backend. Replace each function
// body with the corresponding `apiClient` call (see comments) once the
// FastAPI backend is live — call signatures are already matched.

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getMissions(): Promise<Mission[]> {
  // GET /missions
  await delay();
  return useMissionStore.getState().missions;
}

export async function getMission(id: string): Promise<Mission | undefined> {
  // GET /missions/{id}
  await delay();
  return useMissionStore.getState().missions.find((m) => m.id === id);
}

export async function startMission(id: string): Promise<void> {
  // POST /missions/{id}/start
  await delay(300);
}

export async function pauseMission(id: string): Promise<void> {
  // POST /missions/{id}/pause
  await delay(300);
}

export async function stopMission(id: string): Promise<void> {
  // POST /missions/{id}/stop
  await delay(300);
}

export async function retaskRobot(robotId: string, task: string): Promise<void> {
  // POST /robots/{id}/retask
  await delay(300);
}
