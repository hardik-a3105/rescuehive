import { BatteryCharging, Battery, BatteryLow, BatteryWarning } from "lucide-react";
import { cn } from "@/utils/cn";

export function BatteryIndicator({
  value,
  charging = false,
  size = "md",
}: {
  value: number;
  charging?: boolean;
  size?: "sm" | "md";
}) {
  const color = value < 20 ? "text-critical" : value < 45 ? "text-warning" : "text-success";
  const Icon = charging ? BatteryCharging : value < 20 ? BatteryLow : value < 45 ? BatteryWarning : Battery;

  return (
    <div className={cn("flex items-center gap-1.5", color)}>
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className={cn("mono", size === "sm" ? "text-xs" : "text-sm")}>{Math.round(value)}%</span>
    </div>
  );
}
