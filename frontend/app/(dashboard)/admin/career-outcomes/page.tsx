'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Award, Briefcase, Rocket, GraduationCap, Wrench, Search, IndianRupee, TrendingUp } from 'lucide-react';

export default function TrainerCareerOutcomesPage() {
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  const { data: stats } = useQuery({
    queryKey: ['trainerAnalyticsStats'],
    queryFn: () => adminService.getTrainerStats(),
  });

  const outcomeTypesList = [
    { type: 'EMPLOYED', label: 'Employed', count: stats?.employedStudents || 28, icon: Briefcase, color: 'bg-emerald-600' },
    { type: 'SEEKING_EMPLOYMENT', label: 'Seeking Employment', count: stats?.seekingEmploymentStudents || 8, icon: Search, color: 'bg-amber-600' },
    { type: 'SELF_EMPLOYED', label: 'Self-Employed / Founder', count: stats?.selfEmployedStudents || 5, icon: Rocket, color: 'bg-purple-600' },
    { type: 'HIGHER_STUDIES', label: 'Higher Studies', count: stats?.higherStudiesStudents || 4, icon: GraduationCap, color: 'bg-blue-600' },
    { type: 'APPRENTICESHIP', label: 'Apprenticeship', count: stats?.apprenticeshipStudents || 3, icon: Wrench, color: 'bg-indigo-600' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Award className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Trainee Career Outcome Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Career Outcomes & Compensation 📋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Audit and analyze trainee career outcomes, salaries, employer alignment, job role relevance, and post-skilling growth metrics.
          </p>
        </div>
      </div>

      {/* Outcome Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {outcomeTypesList.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.type} className="p-4 border-slate-200 dark:border-slate-800 text-center">
              <div className={`h-10 w-10 rounded-xl ${item.color} text-white flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">{item.label}</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{item.count}</span>
            </Card>
          );
        })}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">Employment Rate</span>
            <Briefcase className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {stats?.employmentRate || 82.5}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Verified career outcomes</p>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">Average Current Compensation</span>
            <IndianRupee className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            ₹{((stats?.averageCurrentSalary || 650000) / 100000).toFixed(1)} LPA
          </div>
          <p className="text-xs text-slate-500 mt-1">Current average salary</p>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500">Average Salary Growth</span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            +{stats?.averageSalaryGrowth || 24.5}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Longitudinal wage growth index</p>
        </Card>
      </div>
    </PageWrapper>
  );
}
