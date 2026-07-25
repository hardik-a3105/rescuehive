import { CheckCircle2, AlertTriangle, XCircle, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { RobotHealth } from "@/types/domain";

const config: Record<RobotHealth, { variant: "success" | "warning" | "critical" | "muted"; label: string; icon: typeof CheckCircle2 }> = {
  nominal: { variant: "success", label: "Nominal", icon: CheckCircle2 },
  warning: { variant: "warning", label: "Warning", icon: AlertTriangle },
  critical: { variant: "critical", label: "Critical", icon: XCircle },
  offline: { variant: "muted", label: "Offline", icon: PowerOff },
};

export function HealthBadge({ health }: { health: RobotHealth }) {
  const c = config[health];
  const Icon = c.icon;
  return (
    <Badge variant={c.variant} icon={<Icon className="h-3 w-3" />}>
      {c.label}
    </Badge>
  );
}
