import { Play, Pause, Square } from "lucide-react";
import { useMissionStore } from "@/stores/missionStore";
import { useRobotStore } from "@/stores/robotStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { BatteryIndicator } from "@/components/common/BatteryIndicator";
import { ConnectionDot } from "@/components/common/ConnectionDot";
import { formatDuration } from "@/utils/format";
import { toast } from "sonner";
import { startMission, pauseMission, stopMission } from "@/services/api/missions";

export default function MissionPage() {
  const mission = useMissionStore((s) => s.getActiveMission());
  const robots = useRobotStore((s) => s.robots);

  if (!mission) return null;

  return (
    <div className="space-y-4 p-4 lg:p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">{mission.name}</CardTitle>
            <p className="text-xs text-muted mt-0.5">{mission.location}</p>
          </div>
          <Badge variant={mission.status === "active" ? "live" : "muted"} className="capitalize">
            {mission.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="mono text-xl font-semibold text-slate-100">{formatDuration(mission.startedAt)}</p>
              <p className="text-xs text-muted">Elapsed</p>
            </div>
            <div>
              <p className="mono text-xl font-semibold text-slate-100">{Math.round(mission.areaCoverage)}%</p>
              <p className="text-xs text-muted">Coverage</p>
            </div>
            <div>
              <p className="mono text-xl font-semibold text-slate-100">{robots.filter(r=>r.health!=='offline').length}</p>
              <p className="text-xs text-muted">Robots Active</p>
            </div>
          </div>
          <Progress value={mission.areaCoverage} />

          <div className="flex gap-2">
            <Button
              variant="success"
              className="flex-1"
              onClick={async () => { await startMission(mission.id); toast.success("Mission started"); }}
            >
              <Play className="h-4 w-4" /> Start
            </Button>
            <Button
              variant="warning"
              className="flex-1"
              onClick={async () => { await pauseMission(mission.id); toast("Mission paused"); }}
            >
              <Pause className="h-4 w-4" /> Pause
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => { await stopMission(mission.id); toast.error("Mission stopped"); }}
            >
              <Square className="h-4 w-4" /> Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Robots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/70">
            {robots.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <ConnectionDot status={r.connection} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{r.name}</p>
                  <p className="text-xs text-muted capitalize">{r.task.replace("_", " ")}</p>
                </div>
                <BatteryIndicator value={r.battery} size="sm" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
