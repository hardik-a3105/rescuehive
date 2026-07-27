import { Activity, Bot, Users, Flame, BatteryFull, Clock, MapPinned, Wifi } from "lucide-react";
import { StatCard } from "./StatCard";
import { DetectionQueue } from "./DetectionQueue";
import { FleetStatusWidget } from "./FleetStatusWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { useMissionStore } from "@/stores/missionStore";
import { useRobotStore } from "@/stores/robotStore";
import { useDetectionStore } from "@/stores/detectionStore";
import { formatDuration } from "@/utils/format";

export default function DashboardPage() {
  const mission = useMissionStore((s) => s.getActiveMission());
  const robots = useRobotStore((s) => s.robots);
  const hazards = useDetectionStore((s) => s.hazards);

  const activeRobots = robots.filter((r) => r.health !== "offline").length;
  const avgBattery = Math.round(robots.reduce((sum, r) => sum + r.battery, 0) / robots.length);
  const victimsFound = useDetectionStore((s) => s.victims.length);

  if (!mission) return null;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Mission Control Overview</h1>
          <p className="text-sm text-muted">{mission.name} · {mission.location}</p>
        </div>
        <Badge variant={mission.status === "active" ? "live" : "muted"} className="capitalize">
          {mission.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Mission Time" value={0} suffix="" icon={Clock} sublabel={formatDuration(mission.startedAt)} />
        <StatCard label="Area Coverage" value={Math.round(mission.areaCoverage)} suffix="%" icon={MapPinned} tone="live" />
        <StatCard label="Robots Active" value={activeRobots} suffix={`/${robots.length}`} icon={Bot} tone="success" />
        <StatCard label="Victims Found" value={victimsFound} icon={Users} tone="critical" />
        <StatCard label="Hazards Found" value={hazards.length} icon={Flame} tone="warning" />
        <StatCard label="Avg Battery" value={avgBattery} suffix="%" icon={BatteryFull} />
        <StatCard label="Connection" value={activeRobots} suffix=" live" icon={Wifi} tone="live" />
        <StatCard label="Detections/hr" value={12} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-4">
          <DetectionQueue />
          <Card>
            <CardHeader>
              <CardTitle>Search Area Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-300">{mission.searchAreaKm2} km² total search area</span>
                <span className="mono text-slate-200">{Math.round(mission.areaCoverage)}%</span>
              </div>
              <Progress value={mission.areaCoverage} />
            </CardContent>
          </Card>
        </div>
        <FleetStatusWidget />
      </div>
    </div>
  );
}
