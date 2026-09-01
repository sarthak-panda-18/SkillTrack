'use client';

import { ThemeToggle } from './ThemeToggle';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from './NotificationCenter';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 sm:px-8 backdrop-blur-sm">
      <div className="flex md:hidden items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-slate-100">
            SkillTrack <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </Link>
      </div>

      <div className="hidden md:block">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Student Workspace
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <ThemeToggle />
        </div>
        <NotificationCenter />
        <UserNav />
        <MobileNav />
      </div>
    </header>
  );
}
