'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService, TrainerStats } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  Filter,
  Briefcase,
  Users,
  IndianRupee,
  TrendingUp,
  Search,
  Award,
  Sparkles,
} from 'lucide-react';

export default function TrainerAnalyticsPage() {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  const { data: stats, isLoading } = useQuery<TrainerStats>({
    queryKey: ['trainerAnalyticsStats'],
    queryFn: () => adminService.getTrainerStats(),
  });

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </PageWrapper>
    );
  }

  const formatLPA = (amountInINR?: number) => {
    if (!amountInINR || amountInINR === 0) return '₹0.0 LPA';
    return `₹${(amountInINR / 100000).toFixed(1)} LPA`;
  };

  return (
    <PageWrapper className="space-y-8">
      {/* Page Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-indigo-950 text-white shadow-xl border border-indigo-900 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900 text-indigo-200 text-xs font-semibold">
            <LineChartIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>Longitudinal Employment & Outcome Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Employment Analytics & Salary Growth Insights 📊
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl">
            In-depth analytics on employment rate, average compensation, salary progression, job relevance, and satisfaction scores calculated from verified career outcomes.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-5 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Analytics Filters:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto text-xs">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">All Roles</option>
                <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                <option value="DATA_ANALYST">Data Analyst</option>
                <option value="FULLSTACK_DEV">Full Stack Dev</option>
                <option value="AI_ENGINEER">AI Engineer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Outcome Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="EMPLOYED">Employed</option>
                <option value="UNEMPLOYED">Unemployed</option>
                <option value="HIGHER_STUDIES">Higher Studies</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Industry</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full sm:w-44 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">All Industries</option>
                <option value="IT_SOFTWARE">Software & IT</option>
                <option value="FINTECH">Fintech</option>
                <option value="HEALTHCARE">Healthcare Tech</option>
                <option value="ECOMMERCE">E-Commerce</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Employment Rate</span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {stats?.employmentRate || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified outcome ratio</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Average Salary</span>
            <IndianRupee className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {formatLPA(stats?.averageCurrentSalary)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Current compensation LPA</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Salary Growth</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            +{stats?.averageSalaryGrowth || 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Average growth index</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Job Relevance Score</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">
            {stats?.averageJobRelevance || 4.2} / 5
          </div>
          <p className="text-xs text-slate-500 mt-1">Trainee skills alignment</p>
        </Card>
      </div>

      {/* Main Analytics Chart */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart className="h-5 w-5 text-indigo-600" />
            Trainee Compensation Distribution (₹ LPA)
          </CardTitle>
          <CardDescription className="text-xs">
            Visual distribution of employed students across standard salary ranges.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.salaryDistributionChart || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(val: number) => [`${val} Students`, 'Count']} />
              <Legend />
              <Bar dataKey="count" name="Employed Students" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
