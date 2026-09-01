'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Brain,
  Building2,
  Briefcase,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Admin Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-md border border-slate-800 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Platform Administration & Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Administrator Workspace 🛡️
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Manage student registrations, role-based permissions, bulk communications, 20-question assessments, and platform data catalogs.
          </p>
        </div>
      </motion.div>

      {/* Overview Stat Cards with Stagger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Registered student profiles</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Active Accounts
              </CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.activeStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Active student accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Suspended Accounts
              </CardTitle>
              <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.suspendedStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Suspended access</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Skill Catalog
              </CardTitle>
              <Sliders className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.totalSkills || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified engineering skills</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Admin Quick Link Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block group">
          <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Students & Emails
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage accounts & send bulk emails.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/skills" className="block group">
          <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Skill Catalog
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add, edit, or toggle skill definitions.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/career-roles" className="block group">
          <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Career Roles
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure role skill requirements.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/assessments" className="block group">
          <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Assessment Bank
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage 20-question evaluation banks.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
}
