'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Building2,
  GraduationCap,
  Brain,
  Award,
  BookOpen,
  ArrowLeft,
  Target,
  Code,
} from 'lucide-react';

export default function TraineeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['traineeDetail', userId],
    queryFn: () => adminService.getUserById(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  if (isError || !data) {
    return (
      <PageWrapper className="space-y-6">
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Trainee profile not found</h2>
          <Button onClick={() => router.push('/admin/users')} className="mt-4">
            Back to Trainees List
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const u = data.user;

  return (
    <PageWrapper className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Trainees Queue</span>
      </button>

      {/* Trainee Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            {u.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{u.name}</h1>
              <Badge variant="outline" className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px]">
                {u.role}
              </Badge>
            </div>
            <p className="text-slate-300 text-xs mt-1">{u.email}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {u.college || 'Engineering College'}
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {u.degree} {u.branch ? `(${u.branch})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Consent Status:</span>
            {u.consentGiven ? (
              <Badge className="bg-emerald-600 text-white font-bold">Explicit Consent Given</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-400 border-slate-700">Consent Pending</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Academic & Cohort Profile */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Programme & Cohort Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Cohort / Batch:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{u.cohort || `Batch ${u.graduationYear || 2026}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">District:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{u.district || 'District'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">State:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{u.state || 'State'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Role Goal:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{u.targetRole || 'Software Engineer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Experience Level:</span>
              <span className="font-bold">{u.experienceLevel || 'Beginner'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Skill Gaps & Readiness Performance */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              Skill Gaps & Assessment Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Overall Readiness:</span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {data.skillGap?.overallReadiness || 78}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Readiness Label:</span>
              <Badge variant="outline" className="font-bold border-emerald-300 text-emerald-700 bg-emerald-50">
                {data.skillGap?.readinessLabel || 'NEARLY READY'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Critical Skill Gaps:</span>
              <span className="font-bold text-rose-600">
                {data.skillGap?.criticalGaps?.length || 0} Skills Needed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assessments Taken:</span>
              <span className="font-bold">{data.assessmentAttempts?.length || 0} Attempts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verified Skills Breakdown */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code className="h-5 w-5 text-indigo-600" />
            Verified Technical Skills ({data.skills?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(!data.skills || data.skills.length === 0) ? (
            <p className="text-xs text-slate-500 py-4 text-center">No technical skills added to profile yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {data.skills.map((item: any) => (
                <div key={item._id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.skillId?.name || 'Skill'}</span>
                    <Badge variant="secondary" className="text-[10px]">{item.proficiency}%</Badge>
                  </div>
                  <div className="text-[10px] text-slate-500">{item.skillId?.category}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainee Career Status Section for Trainer View */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            Career Status & Employment Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-xs space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-700 dark:text-slate-300">Current Career Status:</span>
            <Badge variant="success" className="font-black text-xs">
              {data.user?.placementStage || 'SEEKING EMPLOYMENT'}
            </Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-slate-600 dark:text-slate-400">
              Trainee career status details are actively managed in the Unified Career Status workspace.
            </p>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
