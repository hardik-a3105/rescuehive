import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * ErrorState — shown when an API call fails.
 * Provides retry functionality and a human-readable error message.
 */
export function ErrorState({
  title = 'Connection Error',
  message = 'Unable to connect to RescueHive backend.',
  onRetry,
  status,
}) {
  const statusText = status
    ? {
        401: 'Authentication required — please log in.',
        403: 'Insufficient permissions for this action.',
        404: 'Requested resource not found.',
        422: 'Invalid data — please check your input.',
        500: 'Internal server error — please try again later.',
      }[status] || `Server returned status ${status}`
    : null;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20">
      <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-4">
        <WifiOff className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-2">
        {statusText || message}
      </p>
      {status > 0 && (
        <span className="text-xs font-mono text-rose-400 mb-4">
          HTTP {status}
        </span>
      )}
      {onRetry && (
        <Button size="md" onClick={onRetry} className="gap-2 mt-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
