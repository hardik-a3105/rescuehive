import { Link } from "react-router-dom";
import { AlertOctagon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <AlertOctagon className="h-12 w-12 text-critical" />
      <div>
        <p className="mono text-5xl font-bold text-slate-100">500</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-200">Command center error</h1>
        <p className="mt-1 text-sm text-muted max-w-sm">
          Something went wrong on our end. The rest of the fleet remains operational.
        </p>
      </div>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Return to dashboard</Button>
      </Link>
    </div>
  );
}
