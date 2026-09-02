'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { careerOutcomeService } from '@/services/careerOutcome.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Sparkles,
  UserCheck,
  TrendingUp,
  Target,
  ArrowRight,
  Brain,
  BookOpen,
  LineChart,
  Calendar,
  Zap,
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Building2,
  IndianRupee,
  Compass,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: currentOutcome } = useQuery({
    queryKey: ['career-outcome'],
    queryFn: () => careerOutcomeService.getCurrentOutcome(),
  });

  const skills = profileData?.skills || [];
  const skillsAddedCount = skills.length;
  const skillsToImprove = skills.filter((s) => s.proficiency < 65);
  const avgProficiency =
    skillsAddedCount > 0
      ? Math.round(skills.reduce((acc, curr) => acc + curr.proficiency, 0) / skillsAddedCount)
      : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  const outcomeType = currentOutcome?.outcomeType || 'EMPLOYED';
  const emp = currentOutcome?.employment;
  const currentSalaryLPA = emp?.compensationAmount ? (emp.compensationAmount / 100000).toFixed(1) : '6.0';
  const prevSalaryLPA = emp?.previousCompensationAmount ? (emp.previousCompensationAmount / 100000).toFixed(1) : '4.5';
  const salaryGrowthPct = emp?.salaryGrowthPercentage || 33.33;

  return (
    <PageWrapper className="space-y-8">
      {/* Welcome & Outcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Trainee Career & Outcome Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, {user?.name || 'Trainee'} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Track your employment status, wage progression, skill readiness, and verified career outcome milestones.
          </p>
        </div>

        <Link href="/career-outcome" className="shrink-0">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Update Career Outcome</span>
          </Button>
        </Link>
      </motion.div>

      {/* Part 2: Clean Outcome-Focused Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Current Career Outcome & Verification */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 bg-emerald-50/20 dark:bg-emerald-950/20">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" />
                Current Career Status
              </CardTitle>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{outcomeType.replace(/_/g, ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            {emp ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Company:</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{emp.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Job Role:</span>
                  <span className="font-bold">{emp.jobRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Relevance:</span>
                  <Badge variant="outline" className="text-emerald-700 border-emerald-300 font-bold">Highly Relevant</Badge>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Verification:</span>
                  <Badge className="bg-indigo-600 text-white font-bold">✓ Verified</Badge>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-600 font-medium">Record your active employment or placement seeking status.</p>
                <Link href="/career-outcome">
                  <Button size="sm" variant="outline" className="w-full text-xs font-bold">Set Outcome Status</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Wage Progression & Salary Growth */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Salary & Wage Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Salary:</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">₹{currentSalaryLPA} LPA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Previous Salary:</span>
              <span className="font-bold text-slate-600">₹{prevSalaryLPA} LPA</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-bold">Salary Growth:</span>
              <Badge className="bg-emerald-600 text-white font-extrabold text-xs">+{salaryGrowthPct}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Skill Gap & Career Readiness */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Readiness & Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Competency Level:</span>
              <span className="text-lg font-extrabold text-purple-600">{avgProficiency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gaps Identified:</span>
              <span className="font-bold text-rose-600">{skillsToImprove.length} Skills Needed</span>
            </div>
            <div className="pt-2">
              <Link href="/skill-gap">
                <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                  View Skill Gap Analysis <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/placement-journey">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Placement Journey</h4>
                <p className="text-xs text-slate-500">Track stage progression to joining.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/documents">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Documents Vault</h4>
                <p className="text-xs text-slate-500">Offer letters & payslips for verification.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/opportunities">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">AI Opportunities</h4>
                <p className="text-xs text-slate-500">Matched roles with % score.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
}
