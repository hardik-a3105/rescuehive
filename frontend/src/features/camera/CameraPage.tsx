import { useMemo, useState } from "react";
import { Maximize2, Camera as CameraIcon, Circle, Thermometer, Layers3 } from "lucide-react";
import { useRobotStore } from "@/stores/robotStore";
import { generateCameraFeeds } from "@/utils/mockData";
import { Badge } from "@/components/ui/Badge";

export default function CameraPage() {
  const robots = useRobotStore((s) => s.robots);
  const feeds = useMemo(() => generateCameraFeeds(robots), [robots]);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Camera Monitoring</h1>
        <p className="text-sm text-muted">{feeds.filter((f) => f.isLive).length} live feeds · {feeds.length} total</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {feeds.map((feed) => (
          <div key={feed.robotId} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-video bg-black">
              <img src={feed.streamUrl} alt={`${feed.robotName} camera feed`} className="h-full w-full object-cover opacity-90" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
                <div className="flex items-center gap-1.5">
                  {feed.isLive && (
                    <Badge variant="live" icon={<Circle className="h-2 w-2 fill-live" />}>
                      LIVE
                    </Badge>
                  )}
                  {feed.isRecording && (
                    <span className="flex items-center gap-1 rounded bg-critical/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      <Circle className="h-2 w-2 fill-white animate-pulse" /> REC
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setExpanded(feed.robotId)}
                  className="rounded bg-black/50 p-1.5 text-white hover:bg-black/70"
                  aria-label="Fullscreen camera"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-2">
                <span className="mono text-[11px] text-white">{feed.fps} FPS · {feed.latencyMs}ms</span>
                <div className="flex gap-1">
                  {feed.hasThermal && <Thermometer className="h-3.5 w-3.5 text-warning" />}
                  {feed.hasDepth && <Layers3 className="h-3.5 w-3.5 text-live" />}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-1.5">
                <CameraIcon className="h-3.5 w-3.5 text-muted" />
                <span className="text-sm font-medium text-slate-200">{feed.robotName}</span>
              </div>
              <span className="mono text-[11px] text-muted">{new Date(feed.lastFrameAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setExpanded(null)}
        >
          <img
            src={feeds.find((f) => f.robotId === expanded)?.streamUrl}
            alt="Expanded camera feed"
            className="max-h-full max-w-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
