import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold tracking-wider uppercase text-zinc-300 font-mono">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-sm border border-white/15 bg-[#0A0A0A] px-3.5 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FFD400] focus-visible:border-[#FFD400] disabled:cursor-not-allowed disabled:opacity-40 transition-all duration-150',
            error && 'border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0A0A0A] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

