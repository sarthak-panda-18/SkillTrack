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
  Building2,
  Briefcase,
  Target,
  Calendar,
  Zap,
  FileCheck,
  GraduationCap,
  Bell,
  FileText,
  MessageSquare,
  Sparkle,
  Compass,
  Building,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const studentWorkspaceItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Career Status', href: '/career-status', icon: Briefcase },
  { name: 'Assessments', href: '/assessment', icon: Brain },
  { name: 'Skill Gap Analysis', href: '/skill-gap', icon: Target },
  { name: 'Training Feedback', href: '/training-feedback', icon: MessageSquare },
  { name: 'Achievements', href: '/achievements', icon: Sparkle },
  { name: 'Company Insights', href: '/company-insights', icon: Building },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export const studentAccountItems = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const studentNavItems = [...studentWorkspaceItems, ...studentAccountItems];

export const trainerWorkspaceItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Trainees', href: '/admin/users', icon: Users },
  { name: 'Training Programs', href: '/admin/programs', icon: GraduationCap },
  { name: 'Cohorts', href: '/admin/cohorts', icon: Building2 },
  { name: 'Assessments', href: '/admin/assessments', icon: Brain },
  { name: 'Skill Gaps', href: '/admin/skill-gaps', icon: Target },
  { name: 'Analytics', href: '/admin/analytics', icon: LineChart },
  { name: 'Opportunities', href: '/admin/opportunities', icon: Zap },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
];

export const trainerAccountItems = [
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const adminNavItems = [...trainerWorkspaceItems, ...trainerAccountItems];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TRAINER';

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background min-h-screen sticky top-0 z-20 select-none transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border bg-surface">
        <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-sm bg-[#FFD400] flex items-center justify-center text-black shadow-md font-bold">
            <Zap className="h-4 w-4 fill-black text-black" />
          </div>
          <span className="font-bold text-xl uppercase tracking-wider text-foreground">
            SKILLTRACK <span className="text-[#FFD400]">AI</span>
          </span>
        </Link>
        {isAdmin && (
          <Badge variant="default" className="text-[10px] py-0.5 px-2 font-mono font-bold bg-[#FFD400] text-black">
            TRAINER
          </Badge>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {isAdmin ? (
          /* TRAINER PORTAL SIDEBAR */
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD400]">
                  TRAINER WORKSPACE
                </span>
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFD400]" />
              </div>
              {trainerWorkspaceItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-semibold tracking-wide transition-all duration-150',
                      isActive
                        ? 'bg-surface-secondary text-foreground border-l-4 border-[#FFD400] pl-3 bg-[#FFD400]/10 font-bold'
                        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-150 group-hover:scale-110',
                        isActive ? 'text-[#FFD400]' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                ACCOUNT
              </div>
              {trainerAccountItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-semibold tracking-wide transition-all duration-150',
                      isActive
                        ? 'bg-surface-secondary text-foreground border-l-4 border-[#FFD400] pl-3 bg-[#FFD400]/10 font-bold'
                        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-150 group-hover:scale-110',
                        isActive ? 'text-[#FFD400]' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          /* STUDENT PORTAL SIDEBAR */
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFD400] px-3 mb-2">
                TRAINEE WORKSPACE
              </div>
              {studentWorkspaceItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-semibold tracking-wide transition-all duration-150',
                      isActive
                        ? 'bg-surface-secondary text-foreground border-l-4 border-[#FFD400] pl-3 bg-[#FFD400]/10 font-bold'
                        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-150 group-hover:scale-110',
                        isActive ? 'text-[#FFD400]' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                ACCOUNT
              </div>
              {studentAccountItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-sm font-semibold tracking-wide transition-all duration-150',
                      isActive
                        ? 'bg-surface-secondary text-foreground border-l-4 border-[#FFD400] pl-3 bg-[#FFD400]/10 font-bold'
                        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-transform duration-150 group-hover:scale-110',
                        isActive ? 'text-[#FFD400]' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

