import { Link } from "react-router-dom";
import { Radar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Radar className="h-12 w-12 text-muted" />
      <div>
        <p className="mono text-5xl font-bold text-slate-100">404</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-200">Sector not found</h1>
        <p className="mt-1 text-sm text-muted max-w-sm">
          The page you're looking for isn't on the map. Check the coordinates and try again.
        </p>
      </div>
      <Link to={ROUTES.DASHBOARD}>
        <Button variant="outline"><ArrowLeft className="h-4 w-4" /> Return to dashboard</Button>
      </Link>
    </div>
  );
}
