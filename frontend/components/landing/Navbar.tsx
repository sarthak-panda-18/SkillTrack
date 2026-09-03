'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Zap, ArrowRight, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface text-foreground transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-sm bg-[#FFD400] flex items-center justify-center text-black font-bold">
            <Zap className="h-4 w-4 fill-black text-black" />
          </div>
          <span className="font-bold text-xl uppercase tracking-wider text-foreground">
            SKILLTRACK <span className="text-[#FFD400]">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-bold uppercase tracking-wider text-xs text-muted-foreground">
          <a href="#features" className="hover:text-[#FFD400] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#FFD400] transition-colors">
            How It Works
          </a>
          <a href="#why-skilltrack" className="hover:text-[#FFD400] transition-colors">
            Why SkillTrack
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" className="gap-2 text-xs font-bold">
                <LayoutDashboard className="h-4 w-4 text-black" />
                DASHBOARD
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-xs font-bold uppercase">
                  SIGN IN
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="gap-1.5 text-xs font-bold">
                  GET STARTED
                  <ArrowRight className="h-4 w-4 text-black" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

