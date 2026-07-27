import { apiClient } from "./client";
import type { VictimDetection, HazardDetection } from "@/types/domain";

export async function getVictims(missionId?: string): Promise<VictimDetection[]> {
  const { data } = await apiClient.get<VictimDetection[]>("/detections/victims", {
    params: { mission_id: missionId },
  });
  return data;
}

export async function updateVictimStatus(id: string, status: string, notes?: string): Promise<VictimDetection> {
  const { data } = await apiClient.patch<VictimDetection>(`/detections/victims/${id}`, { status, notes });
  return data;
}

export async function getHazards(missionId?: string): Promise<HazardDetection[]> {
  const { data } = await apiClient.get<HazardDetection[]>("/detections/hazards", {
    params: { mission_id: missionId },
  });
  return data;
}

export async function updateHazardStatus(id: string, status: string): Promise<HazardDetection> {
  const { data } = await apiClient.patch<HazardDetection>(`/detections/hazards/${id}`, { status });
  return data;
}
