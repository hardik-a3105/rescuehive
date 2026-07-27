import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useRobotStore } from "@/stores/robotStore";
import { BatteryIndicator } from "@/components/common/BatteryIndicator";
import { ConnectionDot } from "@/components/common/ConnectionDot";
import { HealthBadge } from "@/components/common/HealthBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function FleetStatusWidget() {
  const robots = useRobotStore((s) => s.robots);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Robot Fleet</CardTitle>
        <Link to={ROUTES.ROBOTS} className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/70 max-h-[420px] overflow-y-auto scrollbar-thin">
          {robots.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
              <ConnectionDot status={r.connection} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200 truncate">{r.name}</span>
                  <span className="mono text-[10px] text-muted">{r.callsign}</span>
                </div>
                <p className="text-xs text-muted capitalize">{r.task.replace("_", " ")}</p>
              </div>
              <BatteryIndicator value={r.battery} size="sm" charging={r.task === "charging"} />
              <HealthBadge health={r.health} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
