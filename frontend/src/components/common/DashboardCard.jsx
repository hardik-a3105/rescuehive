import React from 'react';
import { cn } from '../../utils/cn';

export function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  className,
  children,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl p-5 border transition-all duration-200',
        'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/90',
        'shadow-sm dark:shadow-xl hover:shadow-md dark:hover:border-slate-700',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-mono font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {title}
          </p>
          {value !== undefined && (
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {value}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {Icon && (
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
