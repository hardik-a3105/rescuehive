import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from '../ui/Button';

export function EmptyState({
  icon: Icon = Layers,
  title = 'No Data Available',
  description = 'No telemetry records or events found matching your criteria.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="p-4 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button size="md" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
