'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService, TrainerStats } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
  Users,
  Building2,
  MapPin,
  GraduationCap,
  Award,
} from 'lucide-react';

import { useChartTheme } from '@/lib/hooks/useChartTheme';

export default function TrainerAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'COHORT' | 'COURSE' | 'PROVIDER' | 'DISTRICT' | 'DEMOGRAPHIC'>('COHORT');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const chartTheme = useChartTheme();

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

  if (statsLoading || cohortLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Page Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-indigo-950 text-white shadow-xl border border-indigo-900 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900 text-indigo-200 text-xs font-semibold">
            <LineChartIcon className="h-3.5 w-3.5 text-indigo-400" />
            <span>SkillTrack AI Programme Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Programme Analytics & Insights 📊
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-2xl">
            Trainee analytics across cohorts, courses, training providers, districts, and demographics.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Total Enrolled Trainees</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.totalStudents || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Active student profiles</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Training Programs</span>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            Active
          </div>
          <p className="text-xs text-slate-500 mt-1">Courses & Streams</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">Assessments Evaluation</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 mt-2">
            Active
          </div>
          <p className="text-xs text-slate-500 mt-1">Competency benchmark</p>
        </Card>
      </div>

      {/* Tab 1: Cohort Analytics */}
      {activeTab === 'COHORT' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 dark:border-slate-800">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Cohort Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Trainees breakdown across active cohorts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortsData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="cohort" tick={{ fontSize: 12, fill: chartTheme.secondaryTextColor }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: chartTheme.secondaryTextColor }} />
                  <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '2px' }} />
                  <Legend />
                  <Bar dataKey="totalTrainees" name="Total Trainees" fill="#FFD400" radius={[4, 4, 0, 0]} />
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
                Course & Program Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Compare trainee numbers across different training courses and branches.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursesData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
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
                Training Provider & College Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Institutional distribution of enrolled trainees.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-extrabold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Provider / College</th>
                    <th className="py-3 px-4">State / Location</th>
                    <th className="py-3 px-4">Trainees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {(providersData || []).map((p: any) => (
                    <tr key={p.providerId} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.city}, {p.state}</td>
                      <td className="py-3 px-4 font-semibold">{p.totalTrainees}</td>
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
                District-Level Trainee Aggregation
              </CardTitle>
              <CardDescription className="text-xs">
                Regional metrics aggregated by district.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtsData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
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
    </PageWrapper>
  );
}
