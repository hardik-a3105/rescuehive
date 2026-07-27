import { Camera, OctagonX, Home, Route, Thermometer, Gauge, Navigation2, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BatteryIndicator } from "@/components/common/BatteryIndicator";
import { ConnectionDot } from "@/components/common/ConnectionDot";
import { HealthBadge } from "@/components/common/HealthBadge";
import type { Robot } from "@/types/domain";
import { useRobotStore } from "@/stores/robotStore";
import { formatCoords, formatDistance, formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

export function RobotCard({ robot }: { robot: Robot }) {
  const emergencyStop = useRobotStore((s) => s.emergencyStop);
  const returnHome = useRobotStore((s) => s.returnHome);
  const toggleTrail = useRobotStore((s) => s.toggleTrail);
  const trailVisibility = useRobotStore((s) => s.trailVisibility);
  const isOffline = robot.health === "offline";

  return (
    <Card className={cn(isOffline && "opacity-60")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Heart
                className={cn(
                  "h-4 w-4",
                  isOffline ? "text-muted" : robot.health === "critical" ? "text-critical" : "text-success",
                  !isOffline && "animate-heartbeat"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{robot.name}</p>
              <p className="mono text-[11px] text-muted">{robot.callsign}</p>
            </div>
          </div>
          <ConnectionDot status={robot.connection} showLabel />
        </div>

        {isOffline && (
          <div className="rounded-md border border-critical/30 bg-critical/10 px-2.5 py-1.5 text-xs text-critical">
            Robot offline · last seen {formatRelativeTime(robot.lastSeen)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between rounded-md bg-surface px-2.5 py-1.5">
            <span className="text-muted">Battery</span>
            <BatteryIndicator value={robot.battery} size="sm" charging={robot.task === "charging"} />
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface px-2.5 py-1.5">
            <span className="text-muted">Signal</span>
            <span className="mono text-slate-200">{Math.round(robot.signal)}%</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface px-2.5 py-1.5">
            <Thermometer className="h-3 w-3 text-muted" />
            <span className="mono text-slate-200">{robot.temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface px-2.5 py-1.5">
            <Gauge className="h-3 w-3 text-muted" />
            <span className="mono text-slate-200">{robot.speed.toFixed(2)} m/s</span>
          </div>
        </div>

        <div className="space-y-1 rounded-md bg-surface px-2.5 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted"><Navigation2 className="h-3 w-3" /> Position</span>
            <span className="mono text-slate-200">{formatCoords(robot.position.lat, robot.position.lng)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Distance travelled</span>
            <span className="mono text-slate-200">{formatDistance(robot.distanceTravelled)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Task</span>
            <span className="capitalize text-slate-200">{robot.task.replace("_", " ")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Last seen</span>
            <span className="text-slate-200">{formatRelativeTime(robot.lastSeen)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(robot.sensors).map(([key, status]) => (
            <span
              key={key}
              className={cn(
                "rounded border px-1.5 py-0.5 text-[10px] capitalize",
                status === "ok" && "border-success/30 text-success bg-success/10",
                status === "degraded" && "border-warning/30 text-warning bg-warning/10",
                status === "fault" && "border-critical/30 text-critical bg-critical/10"
              )}
            >
              {key}
            </span>
          ))}
          <span className="ml-auto"><HealthBadge health={robot.health} /></span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Button size="sm" variant="outline" className="flex-1" disabled={isOffline}>
            <Camera className="h-3.5 w-3.5" /> Camera
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={cn("flex-1", trailVisibility[robot.id] && "border-primary text-primary")}
            onClick={() => toggleTrail(robot.id)}
          >
            <Route className="h-3.5 w-3.5" /> Trail
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isOffline}
            onClick={() => {
              returnHome(robot.id);
              toast.info(`${robot.name} returning to base`);
            }}
          >
            <Home className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isOffline}
            onClick={() => {
              emergencyStop(robot.id);
              toast.error(`Emergency stop issued to ${robot.name}`);
            }}
            aria-label="Emergency stop"
          >
            <OctagonX className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
