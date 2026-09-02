'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-28 rounded-sm border border-border bg-surface-secondary" />;
  }

  const options = [
    { key: 'light', icon: Sun, label: 'LIGHT' },
    { key: 'system', icon: Laptop, label: 'SYSTEM' },
    { key: 'dark', icon: Moon, label: 'DARK' },
  ];

  return (
    <div className="inline-flex items-center p-0.5 rounded-sm bg-surface-secondary border border-border font-mono text-[10px] select-none">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTheme(opt.key)}
            title={`Switch to ${opt.label} theme`}
            className={`flex items-center gap-1 px-2 py-1 rounded-xs font-bold uppercase transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#FFD400] text-black shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="hidden lg:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

