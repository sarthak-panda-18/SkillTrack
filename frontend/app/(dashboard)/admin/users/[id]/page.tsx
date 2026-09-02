'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Target,
  Brain,
  Award,
  BookOpen,
  Calendar,
  Zap,
  TrendingUp,
  FileCheck,
  Clock,
  IndianRupee,
  ArrowLeft,
  CheckCircle2,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
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
  const outcome = data.careerOutcome;
  const outcomeHistory = data.outcomeHistory || [];
  const followUps = data.followUps || [];

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
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Placement Stage:</span>
            <Badge className="bg-indigo-600 text-white font-bold">
              {(u.placementStage || 'SEEKING_EMPLOYMENT').replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Academic & Cohort Profile */}
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

        {/* Column 2: Career Readiness & Assessment Performance */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              Skill Gaps & Readiness Score
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
                {data.skillGap?.criticalGaps?.length || 1} Skills Needed
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assessments Taken:</span>
              <span className="font-bold">{data.assessmentAttempts?.length || 0} Attempts</span>
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Current Outcome & Verification */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              Current Career Outcome
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Outcome Status:</span>
              <Badge className="bg-emerald-600 text-white font-bold">
                {outcome?.outcomeType || 'EMPLOYED'}
              </Badge>
            </div>
            {outcome?.employment && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employer:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{outcome.employment.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Job Role:</span>
                  <span className="font-bold">{outcome.employment.jobRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Salary:</span>
                  <span className="font-bold text-emerald-600">
                    ₹{((outcome.employment.compensationAmount || 600000) / 100000).toFixed(1)} LPA
                  </span>
                </div>
                {outcome.employment.salaryGrowthPercentage ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Salary Growth:</span>
                    <span className="font-bold text-emerald-600">
                      +{outcome.employment.salaryGrowthPercentage}%
                    </span>
                  </div>
                ) : null}
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500">Verification:</span>
              <Badge variant="outline" className="font-bold border-indigo-300 text-indigo-700 bg-indigo-50">
                {outcome?.verificationStatus || 'VERIFIED'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Longitudinal Checkpoints Timeline */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Longitudinal Follow-up History (30 / 90 / 180 / 365 Days)
          </CardTitle>
          <CardDescription className="text-xs">
            Follow-up checkpoints and job continuity responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {followUps.map((f: any) => (
              <div key={f._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{f.checkpoint.replace('_', ' ')}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {f.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500">
                  Due: {new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {f.completedDate && (
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    Completed: {new Date(f.completedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
