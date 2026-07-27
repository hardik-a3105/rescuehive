import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

type Variant = "default" | "live" | "success" | "warning" | "critical" | "muted" | "outline";

const variantClasses: Record<Variant, string> = {
  default: "bg-primary/15 text-primary border-primary/30",
  live: "bg-live/15 text-live border-live/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/15 text-critical border-critical/30",
  muted: "bg-muted/10 text-muted border-muted/20",
  outline: "bg-transparent text-slate-300 border-slate-600",
};

export function Badge({
  children,
  variant = "default",
  className,
  icon,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
