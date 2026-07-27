import { apiClient } from "./client";
import type { Robot } from "@/types/domain";

export async function getRobots(missionId?: string): Promise<Robot[]> {
  const { data } = await apiClient.get<Robot[]>("/robots", {
    params: { mission_id: missionId },
  });
  return data;
}

export async function getRobot(id: string): Promise<Robot | undefined> {
  const { data } = await apiClient.get<Robot>(`/robots/${id}`);
  return data;
}

export async function retaskRobot(id: string, task: string): Promise<void> {
  await apiClient.post(`/robots/${id}/retask`, { task });
}

export async function emergencyStopRobot(id: string): Promise<void> {
  await apiClient.post(`/robots/${id}/emergency-stop`);
}

export async function returnRobotHome(id: string): Promise<void> {
  await apiClient.post(`/robots/${id}/return-home`);
}
