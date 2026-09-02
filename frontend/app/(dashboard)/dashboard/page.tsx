'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
  Brain,
  Zap,
  Award,
  BookOpen,
  LineChart,
  CheckCircle2,
  Code,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>SkillTrack AI Trainee Intelligence Active</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, {user?.name || 'Trainee'} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Evaluate your technical proficiencies, resolve skill gaps, take 20-question assessments, and track your learning progress.
          </p>
        </div>

        <Link href="/assessment" className="shrink-0">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Take Skill Assessment</span>
          </Button>
        </Link>
      </motion.div>

      {/* Core Dashboard Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Skill Gap & Readiness */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-600" />
              Competency & Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Average Proficiency:</span>
              <span className="text-lg font-extrabold text-indigo-600">{avgProficiency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Skills Needing Attention:</span>
              <span className="font-bold text-rose-600">{skillsToImprove.length} Skills</span>
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

        {/* Card 2: Technical Skill Progress */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Code className="h-4 w-4 text-emerald-600" />
              Skill Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Skills Added:</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{skillsAddedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Target Career Role:</span>
              <Badge className="bg-indigo-600 text-white font-bold">{user?.targetRole || 'Software Engineer'}</Badge>
            </div>
            <div className="pt-2">
              <Link href="/progress/growth">
                <Button size="sm" variant="outline" className="w-full text-xs font-bold gap-1">
                  View Skill Growth <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Learning & Study Pathways */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              AI Study Plan & Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Personalized weekly study modules tailored to your target role and skill gaps.
            </p>
            <div className="flex gap-2 pt-2">
              <Link href="/study-plan" className="flex-1">
                <Button size="sm" variant="outline" className="w-full text-xs font-bold">
                  Study Plan
                </Button>
              </Link>
              <Link href="/learning" className="flex-1">
                <Button size="sm" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Roadmap
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/assessment">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Assessments</h4>
                <p className="text-xs text-slate-500">20-question skill evaluations.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/company-insights">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 font-bold">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Company Insights</h4>
                <p className="text-xs text-slate-500">Hiring trends & peer contributions.</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/achievements">
          <Card className="p-5 hover:border-indigo-500 transition-all border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Achievements</h4>
                <p className="text-xs text-slate-500">Milestones & skill badges.</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </PageWrapper>
  );
}
