'use client';

import { ThemeToggle } from './ThemeToggle';
import { UserNav } from './UserNav';
import { MobileNav } from './MobileNav';
import { NotificationCenter } from './NotificationCenter';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-8 transition-colors duration-200">
      <div className="flex md:hidden items-center gap-2">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-[#FFD400] flex items-center justify-center text-black font-bold">
            <Zap className="h-4 w-4 fill-black text-black" />
          </div>
          <span className="font-condensed font-black text-lg uppercase tracking-wider text-foreground">
            SKILLTRACK <span className="text-[#FFD400]">AI</span>
          </span>
        </Link>
      </div>

      <div className="hidden md:block">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#FFD400]">
          CAREER READINESS PLATFORM
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

