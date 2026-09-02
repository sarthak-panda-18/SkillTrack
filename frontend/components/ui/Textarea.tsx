import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold tracking-wider uppercase text-muted-foreground font-mono">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-sm border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFD400] focus-visible:border-[#FFD400] disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150',
            error && 'border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

