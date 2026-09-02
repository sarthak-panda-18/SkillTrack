'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Brain,
  Award,
  BookOpen,
  LineChart,
  TrendingUp,
  User,
  Settings,
  ShieldCheck,
  Users,
  Sliders,
  Building2,
  Briefcase,
  Target,
  Calendar,
  Zap,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const studentNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Skill Assessment', href: '/assessment', icon: Brain },
  { name: 'Assessment History', href: '/assessment/history', icon: Award },
  { name: 'Skill Gap', href: '/skill-gap', icon: Target },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Study Plan', href: '/study-plan', icon: Calendar },
  { name: 'Adaptive Learning', href: '/adaptive-learning', icon: Zap },
  { name: 'Progress', href: '/progress', icon: LineChart },
  { name: 'Skill Growth', href: '/progress/growth', icon: TrendingUp },
  { name: 'Goals & Milestones', href: '/goals', icon: Target },
  { name: 'Career Outcome', href: '/career-outcome', icon: Briefcase },
  { name: 'Career Goal', href: '/career-goal', icon: Target },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const adminNavItems = [
  { name: 'Trainer Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Trainees & Students', href: '/admin/users', icon: Users },
  { name: 'Placement Pipeline', href: '/admin/placement', icon: TrendingUp },
  { name: 'Longitudinal Follow-ups', href: '/admin/follow-ups', icon: Calendar },
  { name: 'Outcome Verification', href: '/admin/outcome-verification', icon: FileCheck },
  { name: 'Skill Gaps & Remedial AI', href: '/admin/skill-gaps', icon: Target },
  { name: 'Programme Analytics', href: '/admin/analytics', icon: LineChart },
  { name: 'Skills Catalog', href: '/admin/skills', icon: Sliders },
  { name: 'Colleges & Providers', href: '/admin/colleges', icon: Building2 },
  { name: 'Career Roles', href: '/admin/career-roles', icon: Briefcase },
  { name: 'Assessments Bank', href: '/admin/assessments', icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-screen sticky top-0 z-20 select-none">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
            SkillTrack <span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </Link>
        {isAdmin && (
          <Badge variant="default" className="text-[10px] py-0 px-1.5 font-bold bg-indigo-600 text-white">
            TRAINER
          </Badge>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Student Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3.5 mb-2">
            Student Workspace
          </div>
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                )}
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform duration-150 group-hover:scale-105',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* TRAINER Section — Visible to ADMIN & TRAINER users */}
        {isAdmin && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between px-3.5 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                TRAINER PORTAL
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-150 group-hover:scale-105',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
