import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-warning" />
      <div>
        <p className="mono text-5xl font-bold text-slate-100">403</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-200">Access restricted</h1>
        <p className="mt-1 text-sm text-muted max-w-sm">
          Your current role doesn't have clearance to view this page. Contact your system administrator if you believe this is an error.
        </p>
      </div>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Return to dashboard</Button>
      </Link>
    </div>
  );
}
