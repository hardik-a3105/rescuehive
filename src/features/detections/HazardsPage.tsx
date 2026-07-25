import { useState } from "react";
import { Flame, Wind, Blocks, Building2, Ban, Check, X } from "lucide-react";
import { useDetectionStore } from "@/stores/detectionStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCoords, formatRelativeTime } from "@/utils/format";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import type { HazardType } from "@/types/domain";

const typeConfig: Record<HazardType, { icon: typeof Flame; label: string }> = {
  fire: { icon: Flame, label: "Fire" },
  gas_leak: { icon: Wind, label: "Gas Leak" },
  debris: { icon: Blocks, label: "Debris" },
  collapsed_structure: { icon: Building2, label: "Collapsed Structure" },
  blocked_path: { icon: Ban, label: "Blocked Path" },
};

const severityVariant = { low: "muted", moderate: "default", severe: "warning", extreme: "critical" } as const;

export default function HazardsPage() {
  const hazards = useDetectionStore((s) => s.hazards);
  const confirmHazard = useDetectionStore((s) => s.confirmHazard);
  const rejectHazard = useDetectionStore((s) => s.rejectHazard);
  const [typeFilter, setTypeFilter] = useState<HazardType | "all">("all");

  const filtered = typeFilter === "all" ? hazards : hazards.filter((h) => h.type === typeFilter);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Hazard Detections</h1>
        <p className="text-sm text-muted">{hazards.length} hazards logged across the search area</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTypeFilter("all")}>
          <Badge variant={typeFilter === "all" ? "default" : "outline"} className={cn("cursor-pointer", typeFilter === "all" && "border-primary")}>
            All
          </Badge>
        </button>
        {(Object.keys(typeConfig) as HazardType[]).map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}>
            <Badge variant={typeFilter === t ? "default" : "outline"} className={cn("cursor-pointer", typeFilter === t && "border-primary")}>
              {typeConfig[t].label}
            </Badge>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((h) => {
          const Icon = typeConfig[h.type].icon;
          return (
            <Card key={h.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img src={h.imageUrl} alt={typeConfig[h.type].label} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 flex items-center gap-1.5">
                  <Badge variant={severityVariant[h.severity]} className="capitalize" icon={<Icon className="h-3 w-3" />}>
                    {typeConfig[h.type].label}
                  </Badge>
                </div>
                <div className="absolute right-2 top-2">
                  <Badge variant={h.status === "confirmed" ? "success" : h.status === "rejected" ? "muted" : "warning"} className="capitalize">
                    {h.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{h.robotName}</span>
                  <span className="text-muted">{formatRelativeTime(h.detectedAt)}</span>
                </div>
                <p className="mono text-muted">{formatCoords(h.position.lat, h.position.lng)}</p>
                <p className="capitalize text-slate-300">Severity: <span className="text-slate-100">{h.severity}</span></p>
                {h.status === "unconfirmed" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="success" className="flex-1" onClick={() => { confirmHazard(h.id); toast.success("Hazard confirmed"); }}>
                      <Check className="h-3.5 w-3.5" /> Confirm
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => { rejectHazard(h.id); toast("Hazard rejected"); }}>
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
