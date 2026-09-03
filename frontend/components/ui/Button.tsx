import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'destructive' | 'danger' | 'outline' | 'secondary' | 'ghost' | 'success' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-bold tracking-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] duration-150';

    const variants = {
      default: 'bg-[#FFD400] text-[#000000] font-bold border-none hover:bg-[#E6BF00] hover:text-[#000000]',
      primary: 'bg-[#FFD400] text-[#000000] font-bold border-none hover:bg-[#E6BF00] hover:text-[#000000]',
      secondary: 'bg-white dark:bg-[#111111] text-[#111111] dark:text-white border border-[#D4D4D4] dark:border-[#444444] hover:bg-[#F3F3F3] hover:text-[#000000] dark:hover:bg-[#1A1A1A] dark:hover:text-white',
      outline: 'bg-transparent text-[#111111] dark:text-white border border-[#D4D4D4] dark:border-[#444444] hover:bg-[#F3F3F3] hover:text-[#000000] dark:hover:bg-[#1A1A1A] dark:hover:text-white',
      ghost: 'bg-transparent text-[#111111] dark:text-white hover:bg-[#F3F3F3] hover:text-[#000000] dark:hover:bg-[#1A1A1A] dark:hover:text-white',
      destructive: 'bg-rose-600 text-white font-bold border-none hover:bg-rose-700',
      danger: 'bg-rose-600 text-white font-bold border-none hover:bg-rose-700',
      success: 'bg-emerald-600 text-white font-bold border-none hover:bg-emerald-700',
      link: 'text-[#FFD400] underline-offset-4 hover:underline p-0 h-auto font-bold',
    };

    const sizes = {
      default: 'h-10 px-5 py-2 text-xs font-bold uppercase tracking-wider',
      sm: 'h-8 px-3 text-xs font-semibold uppercase tracking-wider',
      lg: 'h-12 px-7 text-sm font-bold uppercase tracking-wider',
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

