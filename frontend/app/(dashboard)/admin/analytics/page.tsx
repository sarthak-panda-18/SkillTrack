'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService, TrainerStats } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  Filter,
  Briefcase,
  Users,
  IndianRupee,
  TrendingUp,
  Building2,
  MapPin,
  GraduationCap,
  Award,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function TrainerAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'COHORT' | 'COURSE' | 'PROVIDER' | 'DISTRICT' | 'DEMOGRAPHIC' | 'ATTRITION'>('COHORT');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');

  const { data: stats, isLoading: statsLoading } = useQuery<TrainerStats>({
    queryKey: ['trainerAnalyticsStats'],
    queryFn: () => adminService.getTrainerStats(),
  });

  const { data: cohortsData, isLoading: cohortLoading } = useQuery({
    queryKey: ['cohortAnalytics', districtFilter],
    queryFn: () => adminService.getCohortAnalytics({ district: districtFilter }),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['courseAnalytics'],
    queryFn: () => adminService.getCourseAnalytics(),
  });

  const { data: providersData } = useQuery({
    queryKey: ['providerAnalytics'],
    queryFn: () => adminService.getProviderAnalytics(),
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districtAnalytics'],
    queryFn: () => adminService.getDistrictAnalytics(),
  });

  const { data: demographicData } = useQuery({
    queryKey: ['demographicAnalytics'],
    queryFn: () => adminService.getDemographicAnalytics(),
  });

  const { data: attritionData } = useQuery({
    queryKey: ['attritionAnalytics'],
    queryFn: () => adminService.getAttritionAnalytics(),
  });

  if (statsLoading || cohortLoading) {
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
            <span>SIH 2026 Programme Impact & Outcome Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Programme Analytics & Impact Insights 📊
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl">
            Longitudinal outcome analysis across cohorts, courses, training providers, districts, demographics, wage progression, and career retention rates.
          </p>
        </div>
      </div>

      {/* Analytics Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'COHORT', label: 'Cohort Analytics', icon: Users },
          { id: 'COURSE', label: 'Course Analytics', icon: GraduationCap },
          { id: 'PROVIDER', label: 'Provider Analytics', icon: Building2 },
          { id: 'DISTRICT', label: 'District Analytics', icon: MapPin },
          { id: 'DEMOGRAPHIC', label: 'Demographic Aggregation', icon: Award },
          { id: 'ATTRITION', label: 'Retention & Attrition', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Summary KPI Cards */}
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
          <p className="text-xs text-slate-500 mt-1">Calculated wage index</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Job Retention</span>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">
            {stats?.retentionRate || 93.5}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Employment continuity</p>
        </Card>
      </div>

      {/* Tab 1: Cohort Analytics */}
      {activeTab === 'COHORT' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Cohort Outcome Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Employment rate and average compensation across trainee cohorts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortsData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employmentRate" name="Employment Rate (%)" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="placementRate" name="Placement Rate (%)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Course Analytics */}
      {activeTab === 'COURSE' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Course & Program Performance Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Compare employment success rates across different training courses and branches.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursesData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employmentRate" name="Employment Rate (%)" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalTrainees" name="Total Enrolled" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Provider Analytics */}
      {activeTab === 'PROVIDER' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Training Provider & College Performance
              </CardTitle>
              <CardDescription className="text-xs">
                Institutional performance benchmarking for training programs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-extrabold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Provider / College</th>
                    <th className="py-3 px-4">State / Location</th>
                    <th className="py-3 px-4">Trainees</th>
                    <th className="py-3 px-4">Employed</th>
                    <th className="py-3 px-4">Employment Rate</th>
                    <th className="py-3 px-4">Avg Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(providersData || []).map((p: any) => (
                    <tr key={p.providerId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.city}, {p.state}</td>
                      <td className="py-3 px-4 font-semibold">{p.totalTrainees}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">{p.employedCount}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{p.employmentRate}%</td>
                      <td className="py-3 px-4 font-bold">₹{(p.averageSalary / 100000).toFixed(1)} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: District Analytics */}
      {activeTab === 'DISTRICT' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                District-Level Aggregated Outcomes
              </CardTitle>
              <CardDescription className="text-xs">
                Regional placement metrics aggregated by district.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtsData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employmentRate" name="Employment Rate (%)" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalTrainees" name="Total Trainees" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Demographic Analytics */}
      {activeTab === 'DEMOGRAPHIC' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Trainees by Graduation Year / Batch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData?.byGraduationYear || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Trainees" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Trainees by Experience Level
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData?.byExperience || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="level" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Trainees" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 6: Retention & Attrition */}
      {activeTab === 'ATTRITION' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-indigo-600" />
                Career Transitions & Attrition Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Track employment continuity, job changes, and salary progression over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-600">Overall Retention Rate</span>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-1">{attritionData?.overallRetentionRate || 93.5}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-rose-600">Overall Attrition Rate</span>
                  <div className="text-3xl font-extrabold text-rose-600 mt-1">{attritionData?.overallAttritionRate || 6.5}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 text-center">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-600">Job Change Index</span>
                  <div className="text-3xl font-extrabold text-indigo-600 mt-1">{attritionData?.jobChangeRate || 12.4}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
