'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
            SkillTrack <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            How It Works
          </a>
          <a href="#why-skilltrack" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Why SkillTrack
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard">
              <Button variant="default" className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
