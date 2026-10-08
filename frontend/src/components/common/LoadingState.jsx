import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Acquiring simulated telemetry feeds...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
      <p className="text-xs font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}
