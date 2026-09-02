import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] duration-150';

    const variants = {
      default: 'bg-[#FFD400] text-black font-bold uppercase hover:bg-yellow-hover dark:hover:bg-[#FFE033] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(255,212,0,0.3)] border border-[#FFD400]',
      destructive: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/20',
      outline: 'border border-border bg-surface text-foreground hover:border-[#FFD400] hover:text-[#FFD400] font-bold uppercase tracking-wider',
      secondary: 'bg-surface-secondary border border-border text-foreground hover:bg-surface-hover hover:border-border',
      ghost: 'hover:bg-surface-hover text-muted-foreground hover:text-foreground',
      link: 'text-[#FFD400] underline-offset-4 hover:underline p-0 h-auto font-bold',
    };

    const sizes = {
      default: 'h-10 px-5 py-2 text-xs font-bold uppercase tracking-wider',
      sm: 'h-8 px-3 text-[11px] font-bold uppercase tracking-wider',
      lg: 'h-12 px-7 text-sm font-extrabold uppercase tracking-widest',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

