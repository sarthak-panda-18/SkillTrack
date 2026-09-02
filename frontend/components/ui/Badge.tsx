import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'purple' | 'rose' | 'blue';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40 font-mono text-[11px] uppercase tracking-wider',
    secondary: 'bg-[#171717] text-white border border-white/15 font-mono text-[11px] uppercase tracking-wider',
    outline: 'border border-white/25 text-zinc-300 font-mono text-[11px] uppercase tracking-wider',
    success: 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/40 font-mono text-[11px] uppercase tracking-wider',
    warning: 'bg-amber-950/50 text-[#FFD400] border border-[#FFD400]/40 font-mono text-[11px] uppercase tracking-wider',
    purple: 'bg-[#FFD400]/15 text-[#FFD400] border border-[#FFD400]/40 font-mono text-[11px] uppercase tracking-wider',
    rose: 'bg-rose-950/50 text-rose-400 border border-rose-500/40 font-mono text-[11px] uppercase tracking-wider',
    blue: 'bg-zinc-900 text-white border border-zinc-700 font-mono text-[11px] uppercase tracking-wider',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-sm px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-[#FFD400]',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

