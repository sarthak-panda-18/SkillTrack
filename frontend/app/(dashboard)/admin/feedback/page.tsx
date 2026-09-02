'use client';

import { useQuery } from '@tanstack/react-query';
import { trainingFeedbackService } from '@/services/trainingFeedback.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { MessageSquare, Star, CheckCircle2, AlertTriangle, TrendingUp, BookOpen } from 'lucide-react';

export default function TrainerFeedbackAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['aggregatedFeedbackAnalytics'],
    queryFn: () => trainingFeedbackService.getAggregatedFeedbackAnalytics(),
  });

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Training-to-Job Skill Mismatch Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Training Relevance & Feedback Analytics 💬
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Evaluate trainee feedback on curriculum relevance, practical exposure, interview prep, and identify skills trained vs skills used in employment.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Training Relevance</span>
          <span className="text-3xl font-extrabold text-indigo-600 mt-1 block">{analytics?.averageRelevance || 4.2} / 5</span>
          <p className="text-xs text-slate-500 mt-0.5">Average trainee rating</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Practical Exposure</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{analytics?.averagePractical || 4.0} / 5</span>
          <p className="text-xs text-slate-500 mt-0.5">Hands-on lab rating</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Interview Prep</span>
          <span className="text-3xl font-extrabold text-purple-600 mt-1 block">{analytics?.averageInterviewPrep || 3.8} / 5</span>
          <p className="text-xs text-slate-500 mt-0.5">Mock interview rating</p>
        </Card>

        <Card className="p-5 border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Effectiveness Index</span>
          <span className="text-3xl font-extrabold text-blue-600 mt-1 block">{analytics?.effectivenessScore || 84}%</span>
          <p className="text-xs text-slate-500 mt-0.5">Overall impact score</p>
        </Card>
      </div>

      {/* Skills Trained vs Used Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Most-Used Trained Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-1.5 text-xs">
            {analytics?.topSkillsUsed?.map((s: string, i: number) => (
              <Badge key={i} className="bg-emerald-600 text-white font-bold">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Most Frequently Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-1.5 text-xs">
            {analytics?.topMissingSkills?.map((s: string, i: number) => (
              <Badge key={i} variant="outline" className="text-rose-600 border-rose-300 font-bold">{s}</Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <CardHeader className="p-0 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              Top Curriculum Trained Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-1.5 text-xs">
            {analytics?.topTrainedSkills?.map((s: string, i: number) => (
              <Badge key={i} className="bg-indigo-600 text-white font-bold">{s}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
