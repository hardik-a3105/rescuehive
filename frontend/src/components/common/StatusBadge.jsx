import React from 'react';
import { cn } from '../../utils/cn';

export function StatusBadge({ status, className, showDot = true }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const config = {
    ACTIVE: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500 animate-pulse',
    },
    EXPLORING: {
      bg: 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-500 animate-pulse',
    },
    RETURNING: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    OFFLINE: {
      bg: 'bg-slate-500/15 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    PAUSED: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    CONFIRMED: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    PENDING: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500 animate-ping',
    },
    DISMISSED: {
      bg: 'bg-slate-500/15 dark:bg-slate-500/20 text-slate-500 dark:text-slate-400 border-slate-500/30',
      dot: 'bg-slate-400',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15 dark:bg-rose-500/25 text-rose-700 dark:text-rose-400 border-rose-500/40',
      dot: 'bg-rose-500 animate-ping',
    },
    HIGH: {
      bg: 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30',
      dot: 'bg-rose-500',
    },
    MEDIUM: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
    LOW: {
      bg: 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      dot: 'bg-blue-500',
    },
    CONNECTED: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    DEGRADED: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
      dot: 'bg-amber-500',
    },
  };

  const style = config[normalized] || {
    bg: 'bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border uppercase tracking-wider',
        style.bg,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={cn('relative inline-flex rounded-full h-2 w-2', style.dot)}></span>
        </span>
      )}
      {status}
    </span>
  );
}
