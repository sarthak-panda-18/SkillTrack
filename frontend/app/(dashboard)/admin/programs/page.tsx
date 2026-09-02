'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { GraduationCap, Users, Briefcase, Award, TrendingUp, Building2 } from 'lucide-react';

export default function TrainerProgramsPage() {
  const { data: courseData, isLoading } = useQuery({
    queryKey: ['courseAnalytics'],
    queryFn: () => adminService.getCourseAnalytics(),
  });

  const programsList = [
    { id: 'CS_AI', name: 'Computer Science & AI Skilling', provider: 'National Skilling Center', duration: '6 Months', enrolled: 45, placementRate: 88, avgSalary: '₹7.5 LPA' },
    { id: 'DATA_ENG', name: 'Data Engineering & Analytics', provider: 'IIT Madras Skilling Hub', duration: '4 Months', enrolled: 32, placementRate: 82, avgSalary: '₹6.8 LPA' },
    { id: 'FULLSTACK', name: 'Full-Stack Web Development', provider: 'Tech Skills Academy', duration: '6 Months', enrolled: 50, placementRate: 91, avgSalary: '₹8.2 LPA' },
    { id: 'CLOUDOPS', name: 'Cloud Infrastructure & DevOps', provider: 'Apex Technical Institute', duration: '3 Months', enrolled: 28, placementRate: 79, avgSalary: '₹6.5 LPA' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Training Programme Benchmarking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Training Programs & Curriculum Performance 🎓
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Monitor active skilling courses, enrollment metrics, completion rates, and post-training employment efficacy across training providers.
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programsList.map((prog) => (
          <Card key={prog.id} className="p-6 border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all">
            <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    {prog.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {prog.provider}
                  </CardDescription>
                </div>
                <Badge className="bg-indigo-600 text-white font-bold text-xs">{prog.duration}</Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Enrolled</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{prog.enrolled}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200">
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase block">Placement</span>
                <span className="text-lg font-extrabold text-emerald-600">{prog.placementRate}%</span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase block">Avg Salary</span>
                <span className="text-lg font-extrabold text-indigo-600">{prog.avgSalary}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
