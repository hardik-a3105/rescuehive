import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

const TABS = ["General", "Notifications", "Map & Units", "Security"] as const;

function Toggle({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        onClick={() => setChecked((v) => !v)}
        className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-slate-700")}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
      <h1 className="text-lg font-semibold text-slate-100">Settings</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-2 text-sm border-b-2 -mb-px",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-slate-300"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <Card>
          <CardHeader><CardTitle>General</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border/70">
            <Toggle label="Compact sidebar" description="Collapse navigation labels by default" />
            <Toggle label="24-hour clock" description="Display mission clock in 24-hour format" defaultChecked />
            <Toggle label="Reduced motion" description="Minimize animations across the interface" />
          </CardContent>
        </Card>
      )}

      {tab === "Notifications" && (
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border/70">
            <Toggle label="Victim detection alerts" description="Notify immediately on new victim detections" defaultChecked />
            <Toggle label="Hazard alerts" description="Notify immediately on new hazard detections" defaultChecked />
            <Toggle label="Battery low warnings" description="Notify when any robot battery drops below 20%" defaultChecked />
            <Toggle label="Robot offline alerts" description="Notify when connection to a robot is lost" defaultChecked />
          </CardContent>
        </Card>
      )}

      {tab === "Map & Units" && (
        <Card>
          <CardHeader><CardTitle>Map & Units</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border/70">
            <Toggle label="Show robot trails by default" description="Display path history on map load" />
            <Toggle label="Metric units" description="Use meters/kilometers instead of feet/miles" defaultChecked />
            <Toggle label="Heat map overlay" description="Show detection density heat map by default" defaultChecked />
          </CardContent>
        </Card>
      )}

      {tab === "Security" && (
        <Card>
          <CardHeader><CardTitle>Security</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Toggle label="Two-factor authentication" description="Require a verification code at login" />
            <Toggle label="Session timeout after 30 min" description="Automatically sign out inactive sessions" defaultChecked />
            <Button variant="outline" onClick={() => toast.info("Password reset email sent")}>
              Change password
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
