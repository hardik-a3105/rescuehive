import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-amber-400" />
      </div>
      <h1 className="text-2xl font-bold font-mono text-white mb-2">404: RESOURCE NOT FOUND</h1>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        The requested telemetry view or endpoint is not registered in the Phase 0 platform.
      </p>
      <Link to="/">
        <Button size="md" className="gap-2 font-mono text-xs">
          <Home className="w-4 h-4" />
          Return to Foundation Console
        </Button>
      </Link>
    </div>
  );
}
