'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { adminService, TrainerStats } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Users,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Brain,
  Building2,
  LineChart as LineChartIcon,
  Award,
  Zap,
  MessageSquare,
  Target,
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

export default function TrainerDashboardPage() {
  const { data: stats, isLoading } = useQuery<TrainerStats>({
    queryKey: ['trainerDashboardStats'],
    queryFn: () => adminService.getTrainerStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Trainer Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-xl border border-slate-800 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Trainer Portal & Analytics Control</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Trainer Dashboard 🎯
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
            Monitor trainee performance, track technical skill gaps across cohorts, evaluate assessment readiness, and manage training feedback.
          </p>
        </div>
      </motion.div>

      {/* Core Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* 1. Total Students */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-indigo-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Total Trainees
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.totalStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Enrolled student profiles</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Training Programs */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-emerald-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Training Programs
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                Active
              </div>
              <p className="text-xs text-slate-500 mt-1">Cohorts & Branches</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Skill Gap Analysis */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-purple-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Skill Gaps Tracked
              </CardTitle>
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                Active
              </div>
              <p className="text-xs text-slate-500 mt-1">Competency evaluation</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Assessment Readiness */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-amber-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Assessments
              </CardTitle>
              <Brain className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                Ready
              </div>
              <p className="text-xs text-slate-500 mt-1">20-question evaluations</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Trainer Action Recommendations & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Trainer Action Center
            </CardTitle>
            <CardDescription className="text-xs">Action recommendations derived from trainee skill analytics.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span>HIGH PRIORITY — Skill Gap Identified</span>
                <Badge className="bg-amber-600 text-white font-bold text-[9px]">Active Trainees</Badge>
              </div>
              <p className="text-[11px]">Backend trainees require additional guidance on framework subjects.</p>
              <Link href="/admin/skill-gaps" className="text-indigo-600 font-bold hover:underline block pt-1">
                Conduct Skill Gap Review →
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span>MEDIUM PRIORITY — Training Feedback</span>
                <Badge className="bg-indigo-600 text-white font-bold text-[9px]">Feedback Items</Badge>
              </div>
              <p className="text-[11px]">Review feedback submitted by trainees regarding training programs.</p>
              <Link href="/admin/feedback" className="text-indigo-600 font-bold hover:underline block pt-1">
                Review Program Feedback →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Skilling & Readiness Overview
            </CardTitle>
            <CardDescription className="text-xs">Summary of training progress across active cohorts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">Overall Skilling Progress</span>
              <span className="text-2xl font-extrabold text-emerald-600">Active</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Assessments Bank:</span>
                <span className="font-bold">20 Questions / Skill</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Skill Gap Resolution:</span>
                <span className="font-bold text-indigo-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainer Quick Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block group">
          <Card className="p-5 hover:border-indigo-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Trainees & Students
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitor trainee profiles.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/skill-gaps" className="block group">
          <Card className="p-5 hover:border-purple-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Skill Gap Analytics
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Identify cohort skill gaps.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/analytics" className="block group">
          <Card className="p-5 hover:border-sky-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                <LineChartIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  Programme Analytics
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Filter by cohort & course.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/assessments" className="block group">
          <Card className="p-5 hover:border-amber-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Assessments Bank
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage evaluation question sets.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
}
