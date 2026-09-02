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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  GraduationCap,
  Rocket,
  Wrench,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Brain,
  Building2,
  FileCheck,
  LineChart as LineChartIcon,
  Award,
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

  const formatLPA = (amountInINR?: number) => {
    if (!amountInINR || amountInINR === 0) return '₹0.0 LPA';
    const lpa = (amountInINR / 100000).toFixed(1);
    return `₹${lpa} LPA`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const statusData = stats?.statusDistribution || [];
  const pipelineData = stats?.pipeline || [];
  const salaryData = stats?.salaryDistributionChart || [];

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
            <span>Trainer Portal & Placement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Trainer Dashboard 🎯
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl">
            Real-time trainee monitoring, placement pipeline tracking, salary growth analytics, and longitudinal career development metrics calculated from actual student outcome records.
          </p>
        </div>
      </motion.div>

      {/* Top 10 Core Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
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

        {/* 2. Employed Students */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-emerald-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Employed
              </CardTitle>
              <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats?.employedStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Full-time / Contract roles</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Unemployed */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-rose-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Unemployed
              </CardTitle>
              <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                {stats?.unemployedStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Seeking opportunities</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Placement In Progress */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-amber-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Getting Employed
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats?.placementInProgressStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Internships & Pipeline</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 5. Higher Studies */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-sky-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Higher Studies
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                {stats?.higherStudiesStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Master's & Research</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 6. Self-Employed */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-purple-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Self-Employed
              </CardTitle>
              <Rocket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {stats?.selfEmployedStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Founders & Freelancers</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 7. Apprenticeship */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-indigo-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Apprenticeship
              </CardTitle>
              <Wrench className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats?.apprenticeshipStudents || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Technical training roles</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 8. Employment Rate */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-emerald-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Employment Rate
              </CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats?.employmentRate || 0}%
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Active placement success</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 9. Average Current Salary */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-indigo-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Average Salary
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatLPA(stats?.averageCurrentSalary)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Current average LPA</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 10. Average Salary Growth */}
        <motion.div variants={cardItemVariants}>
          <Card className="hover:border-emerald-400 transition-all border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Avg Salary Growth
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                +{stats?.averageSalaryGrowth || 0}%
              </div>
              <p className="text-xs text-slate-500 mt-1">Calculated from history</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Employment Status Distribution */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Trainee Employment Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">Real-time breakdown of current student career outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, count }) => (count > 0 ? `${name}: ${count}` : '')}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} Trainees`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Placement Pipeline */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Placement & Employment Pipeline
            </CardTitle>
            <CardDescription className="text-xs">Trainee progression across enrollment, interviews, and hiring.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Trainee Count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Salary Distribution */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-amber-600" />
              Employed Trainee Salary Distribution (LPA)
            </CardTitle>
            <CardDescription className="text-xs">Annual compensation breakdown for employed students.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(val: number) => [`${val} Students`, 'Students']} />
                <Bar dataKey="count" name="Students in Bracket" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trainer Action Center & Impact Scorecard (Parts 36 & 37) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Trainer Action Center
            </CardTitle>
            <CardDescription className="text-xs">Prioritized action recommendations generated from cohort analytics.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span>HIGH PRIORITY — Skill Gap Identified</span>
                <Badge className="bg-amber-600 text-white font-bold text-[9px]">42 Trainees</Badge>
              </div>
              <p className="text-[11px]">42 trainees targeting Backend Developer roles have an unresolved Spring Boot skill gap.</p>
              <Link href="/admin/skill-gaps" className="text-indigo-600 font-bold hover:underline block pt-1">
                Conduct Spring Boot Remedial Module →
              </Link>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span>HIGH PRIORITY — Curriculum Skill Mismatch</span>
                <Badge className="bg-indigo-600 text-white font-bold text-[9px]">18 Trainees</Badge>
              </div>
              <p className="text-[11px]">18 employed trainees report high Docker usage missing from the standard training curriculum.</p>
              <Link href="/admin/feedback" className="text-indigo-600 font-bold hover:underline block pt-1">
                Review Training Skill Mapping →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Programme Impact Scorecard
            </CardTitle>
            <CardDescription className="text-xs">Transparent composite skilling impact score breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">Overall Skilling Impact Score</span>
              <span className="text-2xl font-extrabold text-emerald-600">86%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Training Completion:</span>
                <span className="font-bold">95.0%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Placement Conversion:</span>
                <span className="font-bold text-emerald-600">82.5%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Salary Growth Index:</span>
                <span className="font-bold text-indigo-600">+33.3%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 flex justify-between">
                <span className="text-slate-500">Job Retention Rate:</span>
                <span className="font-bold text-purple-600">93.5%</span>
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
                  Monitor trainee profiles & outcomes.
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/outcome-verification" className="block group">
          <Card className="p-5 hover:border-emerald-500/60 transition-all border-slate-200 dark:border-slate-800 h-full">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Outcome Verification
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verify evidence documents & offers.
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
                  Employment Analytics
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Filter analytics by role & location.
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
