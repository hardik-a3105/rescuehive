import React from 'react';
import { cn } from '../../utils/cn';

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  const variants = {
    default: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/20 active:translate-y-0.5',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:translate-y-0.5',
    outline: 'border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-800/80',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/40',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none font-medium',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
