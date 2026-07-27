import { useMemo, useState } from "react";
import { Check, X, ShieldAlert } from "lucide-react";
import { useDetectionStore } from "@/stores/detectionStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import { formatCoords, formatDistance, formatRelativeTime } from "@/utils/format";
import { toast } from "sonner";
import type { DetectionStatus } from "@/types/domain";

const TABS: Array<{ label: string; value: DetectionStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Unconfirmed", value: "unconfirmed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Rejected", value: "rejected" },
];

const priorityVariant = { low: "muted", medium: "default", high: "warning", critical: "critical" } as const;

export default function VictimsPage() {
  const victims = useDetectionStore((s) => s.victims);
  const confirmVictim = useDetectionStore((s) => s.confirmVictim);
  const rejectVictim = useDetectionStore((s) => s.rejectVictim);
  const setNotes = useDetectionStore((s) => s.setVictimNotes);
  const [tab, setTab] = useState<DetectionStatus | "all">("unconfirmed");

  const filtered = useMemo(
    () => (tab === "all" ? victims : victims.filter((v) => v.status === tab)),
    [victims, tab]
  );

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Victim Detections</h1>
          <p className="text-sm text-muted">AI-flagged detections require human confirmation before dispatch.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs text-warning">
          <ShieldAlert className="h-3.5 w-3.5" />
          Never shown as confirmed until reviewed
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}>
            <Badge variant={tab === t.value ? "default" : "outline"} className={cn("cursor-pointer", tab === t.value && "border-primary")}>
              {t.label} ({t.value === "all" ? victims.length : victims.filter((v) => v.status === t.value).length})
            </Badge>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <img src={v.imageUrl} alt="Victim detection" className="h-full w-full object-cover" />
              <div className="absolute left-2 top-2 flex gap-1.5">
                <Badge variant={priorityVariant[v.priority]} className="capitalize">{v.priority}</Badge>
                <Badge
                  variant={v.status === "confirmed" ? "success" : v.status === "rejected" ? "muted" : "warning"}
                  className="capitalize"
                >
                  {v.status}
                </Badge>
              </div>
              <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 mono text-[11px] text-white">
                {v.confidence}%
              </div>
            </div>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">{v.robotName}</span>
                <span className="text-muted">{formatRelativeTime(v.detectedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span className="mono">{formatCoords(v.position.lat, v.position.lng)}</span>
                <span>{formatDistance(v.distance)} away</span>
              </div>
              <textarea
                placeholder="Add notes for responders..."
                defaultValue={v.notes}
                onBlur={(e) => setNotes(v.id, e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-primary"
                rows={2}
              />
              {v.status === "unconfirmed" && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="success"
                    className="flex-1"
                    onClick={() => {
                      confirmVictim(v.id);
                      toast.success("Victim detection confirmed");
                    }}
                  >
                    <Check className="h-3.5 w-3.5" /> Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      rejectVictim(v.id);
                      toast("Detection rejected");
                    }}
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted">No detections in this view.</p>
        )}
      </div>
    </div>
  );
}
