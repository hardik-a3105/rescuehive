import { useAuthStore } from "@/stores/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { roleLabel } from "@/utils/format";
import { Radio } from "lucide-react";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 lg:p-6">
      <h1 className="text-lg font-semibold text-slate-100">Profile</h1>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-semibold text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge>{roleLabel(user.role)}</Badge>
              {user.callsign && (
                <Badge variant="live" icon={<Radio className="h-3 w-3" />}>{user.callsign}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account details</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border/70 pb-2">
            <span className="text-muted">User ID</span>
            <span className="mono text-slate-200">{user.id}</span>
          </div>
          <div className="flex justify-between border-b border-border/70 pb-2">
            <span className="text-muted">Role</span>
            <span className="text-slate-200">{roleLabel(user.role)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Callsign</span>
            <span className="mono text-slate-200">{user.callsign ?? "—"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline">Edit profile</Button>
      </div>
    </div>
  );
}
