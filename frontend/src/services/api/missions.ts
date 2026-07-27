import { apiClient } from "./client";
import type { Mission } from "@/types/domain";

export async function getMissions(): Promise<Mission[]> {
  const { data } = await apiClient.get<Mission[]>("/missions");
  return data;
}

export async function getMission(id: string): Promise<Mission | undefined> {
  const { data } = await apiClient.get<Mission>(`/missions/${id}`);
  return data;
}

export async function startMission(id: string): Promise<void> {
  await apiClient.post(`/missions/${id}/start`);
}

export async function pauseMission(id: string): Promise<void> {
  await apiClient.post(`/missions/${id}/pause`);
}

export async function stopMission(id: string): Promise<void> {
  await apiClient.post(`/missions/${id}/stop`);
}
