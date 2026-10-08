import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    primary: 'bg-cyan-950/70 text-cyan-400 border-cyan-800/80',
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/80',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/80',
    outline: 'bg-transparent text-slate-400 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
