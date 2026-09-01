'use client';

import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800" />;
  }

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Current theme: ${theme}. Click to change.`}
      className="h-9 w-9 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4 text-indigo-400" />
      ) : theme === 'light' ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Laptop className="h-4 w-4 text-zinc-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
