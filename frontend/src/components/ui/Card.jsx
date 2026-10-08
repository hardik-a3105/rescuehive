import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ children, className, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl transition-all duration-200',
        glow && 'border-cyan-500/30 shadow-cyan-950/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold tracking-wide uppercase text-slate-300 font-mono flex items-center gap-2', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn('space-y-3', className)} {...props}>{children}</div>;
}
