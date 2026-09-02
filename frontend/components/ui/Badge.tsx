import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'purple' | 'rose' | 'blue' | 'accent';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#FFD400]/15 text-yellow-900 dark:text-[#FFD400] border border-[#FFD400]/40 font-mono text-[11px] uppercase tracking-wider font-bold',
    secondary: 'bg-surface-secondary text-foreground border border-border font-mono text-[11px] uppercase tracking-wider',
    outline: 'border border-border text-muted-foreground font-mono text-[11px] uppercase tracking-wider',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono text-[11px] uppercase tracking-wider font-semibold',
    warning: 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/30 font-mono text-[11px] uppercase tracking-wider font-semibold',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 font-mono text-[11px] uppercase tracking-wider font-semibold',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-mono text-[11px] uppercase tracking-wider font-semibold',
    blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30 font-mono text-[11px] uppercase tracking-wider font-semibold',
    accent: 'bg-[#FFD400] text-black font-extrabold font-mono text-[11px] uppercase tracking-wider',
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

