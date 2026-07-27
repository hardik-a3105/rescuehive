import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  tone = "default",
  sublabel,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "critical" | "live";
  sublabel?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 700;
    const start = performance.now();
    const from = display;
    const animate = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      setDisplay(Math.round(from + (value - from) * progress));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const toneClasses: Record<string, string> = {
    default: "text-slate-100 bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    critical: "bg-critical/10 text-critical",
    live: "bg-live/10 text-live",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/80 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mono mt-2 text-2xl font-semibold text-slate-100">
        {display}
        <span className="text-base text-muted">{suffix}</span>
      </p>
      {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
    </motion.div>
  );
}
