import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check, ShieldAlert, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';

export function AlertCard({ alert, onAcknowledge, isLoading = false }) {
  const { id, severity, title, message, description, timestamp, robotName, sector, status, acknowledged } = alert;

  const isAck = acknowledged || status === 'ACKNOWLEDGED';
  const desc = description || message || 'No event description provided';

  const severityConfig = {
    CRITICAL: {
      border: 'border-rose-600/40 dark:border-rose-600/50',
      bg: 'bg-rose-50/60 dark:bg-rose-950/30',
      iconBg: 'bg-rose-600/15 text-rose-600 dark:text-rose-400',
      Icon: ShieldAlert,
    },
    HIGH: {
      border: 'border-rose-500/30 dark:border-rose-500/40',
      bg: 'bg-rose-50/40 dark:bg-rose-950/20',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      Icon: ShieldAlert,
    },
    MEDIUM: {
      border: 'border-amber-500/30 dark:border-amber-500/40',
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      Icon: AlertTriangle,
    },
    LOW: {
      border: 'border-blue-500/30 dark:border-blue-500/40',
      bg: 'bg-blue-50/40 dark:bg-blue-950/20',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      Icon: Info,
    },
  };

  const style = severityConfig[severity] || severityConfig.LOW;
  const { Icon } = style;

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${style.border} ${style.bg} ${
        isAck ? 'opacity-60 saturate-50' : 'shadow-sm dark:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={severity} />
              <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white font-mono">
                {title}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {desc}
            </p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              <span>Origin: {robotName || 'Fleet Stream'}</span>
              <span>•</span>
              <span>{sector || 'Sector Core'}</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>

        {!isAck && onAcknowledge && (
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onAcknowledge(id)}
            className="shrink-0 text-[11px] font-mono gap-1"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            Ack
          </Button>
        )}
      </div>
    </div>
  );
}
