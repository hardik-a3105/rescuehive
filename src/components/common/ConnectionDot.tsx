import { cn } from "@/utils/cn";
import type { ConnectionHealth } from "@/types/domain";

const config: Record<ConnectionHealth, { color: string; label: string }> = {
  live: { color: "bg-live", label: "Live" },
  degraded: { color: "bg-warning", label: "Degraded" },
  stale: { color: "bg-muted", label: "Stale" },
  offline: { color: "bg-critical", label: "Offline" },
};

export function ConnectionDot({ status, showLabel = false }: { status: ConnectionHealth; showLabel?: boolean }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex h-2 w-2">
        {status === "live" && (
          <span className={cn("absolute inset-0 rounded-full animate-pulseRing", c.color)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", c.color)} />
      </span>
      {showLabel && <span className="text-xs text-muted">{c.label}</span>}
    </span>
  );
}
