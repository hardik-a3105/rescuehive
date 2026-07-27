import { Check, X, Eye, Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDetectionStore } from "@/stores/detectionStore";
import { formatRelativeTime, formatCoords } from "@/utils/format";
import { toast } from "sonner";

const priorityVariant = {
  low: "muted",
  medium: "default",
  high: "warning",
  critical: "critical",
} as const;

export function DetectionQueue() {
  const victims = useDetectionStore((s) => s.victims);
  const confirmVictim = useDetectionStore((s) => s.confirmVictim);
  const rejectVictim = useDetectionStore((s) => s.rejectVictim);

  const unconfirmed = victims.filter((v) => v.status === "unconfirmed").slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection Queue</CardTitle>
        <Badge variant="warning">{victims.filter((v) => v.status === "unconfirmed").length} unconfirmed</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {unconfirmed.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Inbox className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">No pending detections. Queue is clear.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {unconfirmed.map((v) => (
              <li key={v.id} className="flex items-center gap-3 p-3">
                <img
                  src={v.imageUrl}
                  alt="Detection thumbnail"
                  className="h-12 w-16 shrink-0 rounded-md object-cover border border-border"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="mono text-xs text-slate-300">{v.robotName}</span>
                    <Badge variant={priorityVariant[v.priority]} className="capitalize">{v.priority}</Badge>
                  </div>
                  <p className="mono truncate text-xs text-muted">{formatCoords(v.position.lat, v.position.lng)}</p>
                  <p className="text-xs text-muted">{v.confidence}% confidence · {formatRelativeTime(v.detectedAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="success"
                    aria-label="Confirm detection"
                    onClick={() => {
                      confirmVictim(v.id);
                      toast.success("Detection confirmed", { description: `${v.robotName} report marked confirmed.` });
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    aria-label="Reject detection"
                    onClick={() => {
                      rejectVictim(v.id);
                      toast("Detection rejected");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="View details">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
