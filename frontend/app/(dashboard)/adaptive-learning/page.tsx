'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
  CheckSquare,
  XCircle,
  Flame,
  Award,
  Layers,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import { adaptiveService } from '@/services/adaptive.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { AdaptiveLearningState, AdaptiveRecommendation, SkillTrendItem } from '@/types/adaptive';

export default function AdaptiveLearningPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Fetch adaptive state & active recommendations
  const { data, isLoading, error } = useQuery<{
    state: AdaptiveLearningState;
    recommendations: AdaptiveRecommendation[];
  }>({
    queryKey: ['adaptive-learning'],
    queryFn: () => adaptiveService.getAdaptiveState(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const analyzeMutation = useMutation({
    mutationFn: () => adaptiveService.analyzeProgress(),
    onSuccess: (newData) => {
      queryClient.setQueryData(['adaptive-learning'], newData);
      toast.success('Adaptive learning analysis updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update analysis.');
    },
  });

  const updateRecMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'DISMISSED' | 'COMPLETED' }) =>
      adaptiveService.updateRecommendationStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['adaptive-learning'] });
      toast.success(`Recommendation marked as ${status.toLowerCase()}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update recommendation.');
    },
  });

  const handleAcceptRecommendation = (rec: AdaptiveRecommendation) => {
    updateRecMutation.mutate({ id: rec._id, status: 'ACCEPTED' });
    if (rec.actionRoute) {
      router.push(rec.actionRoute);
    }
  };

  const handleDismissRecommendation = (rec: AdaptiveRecommendation) => {
    updateRecMutation.mutate({ id: rec._id, status: 'DISMISSED' });
  };

  if (isLoading) {
    return (
      <PageWrapper className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    const errObj = (error as any)?.response?.data;
    const errCode = errObj?.code;
    const errMsg = errObj?.message;

    if (errCode === 'TARGET_ROLE_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
              <Brain className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Target Career Role Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {errMsg || 'Please select a target career role in your profile to activate Adaptive Intelligence.'}
            </p>
            <Link href="/profile">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                Select Target Career Role
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'SKILL_GAP_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Skill Gap Analysis Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {errMsg || 'Complete your Skill Gap Analysis first.'}
            </p>
            <Link href="/skill-gap">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                Run Skill Gap Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'ROADMAP_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
              <Layers className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Personalized Roadmap Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {errMsg || 'Generate your personalized learning roadmap first.'}
            </p>
            <Link href="/learning">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                Generate Learning Roadmap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'STUDY_PLAN_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Study Plan Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {errMsg || 'Generate your personalized study plan first.'}
            </p>
            <Link href="/study-plan">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                Generate Study Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    // Default Error UI for Genuine Server Failures (500 / Network Error)
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Adaptive Intelligence Temporarily Unavailable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {errMsg || 'An unexpected error occurred while generating your adaptive learning intelligence.'}
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['adaptive-learning'] })}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const { state, recommendations = [] } = data;
  const {
    careerRoleName,
    skillsAnalyzedCount = 0,
    improvingCount = 0,
    stableCount = 0,
    decliningCount = 0,
    insufficientDataCount = 0,
    estimatedLearningVelocity = 0,
    studyConsistencyPercentage = 0,
    aiSummary,
    trends = [],
  } = state;

  // Filter recommendations
  const activeRecommendations = recommendations.filter((r) => r.status === 'NEW' || r.status === 'VIEWED');
  const filteredRecs = activeRecommendations.filter((r) => {
    if (filterPriority === 'ALL') return true;
    return r.priority === filterPriority;
  });

  const nextBestAction = activeRecommendations[0];

  const improvingSkills = trends.filter((t) => t.trend === 'IMPROVING');
  const strugglingSkills = trends.filter((t) => t.gap > 15 || t.trend === 'DECLINING');

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-purple-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              Adaptive Intelligence Engine
            </span>
            {estimatedLearningVelocity > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/30">
                <Zap className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                +{estimatedLearningVelocity} pts / wk Velocity
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Adaptive Learning Pathway for {careerRoleName}
          </h1>
          <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">{aiSummary}</p>
        </div>

        <Button
          onClick={() => analyzeMutation.mutate()}
          isLoading={analyzeMutation.isPending}
          variant="outline"
          className="relative z-10 border-white/20 text-white hover:bg-white/10 font-bold text-xs gap-2 shrink-0"
        >
          <RotateCw className="h-4 w-4" />
          Analyze Latest Progress
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider block">
              Skills Analyzed
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {skillsAnalyzedCount}
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold block">Target Role Skills</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/10">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-extrabold tracking-wider block flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Improving
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {improvingCount}
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold block">Positive Score Growth</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-extrabold tracking-wider block flex items-center gap-1">
              <Minus className="h-3.5 w-3.5" /> Stable / Baseline
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {stableCount + insufficientDataCount}
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold block">Consistent Proficiency</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-purple-200 dark:border-purple-900/60 bg-purple-50/10 dark:bg-purple-950/10">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-extrabold tracking-wider block flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Study Consistency
            </span>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {studyConsistencyPercentage}%
            </div>
            <span className="text-[11px] text-zinc-500 font-semibold block">Plan Execution Rate</span>
          </CardContent>
        </Card>
      </div>

      {/* Highlighted Next Best Action Card */}
      {nextBestAction && (
        <Card className="shadow-md border-2 border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/30 dark:from-purple-950/40 dark:via-zinc-900 dark:to-purple-950/20">
          <CardHeader className="pb-2 border-b border-purple-100 dark:border-purple-900/40 flex flex-row justify-between items-center">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Compass className="h-4 w-4 text-purple-600" />
              Primary Next Best Action
            </CardTitle>
            <Badge
              variant={
                nextBestAction.priority === 'CRITICAL'
                  ? 'rose'
                  : nextBestAction.priority === 'HIGH'
                  ? 'purple'
                  : 'default'
              }
              className="text-[10px] uppercase font-bold"
            >
              {nextBestAction.priority} PRIORITY
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold">
                    {nextBestAction.type.replace('_', ' ')}
                  </Badge>
                  {nextBestAction.skillName && (
                    <Badge variant="purple" className="text-[10px] py-0 font-bold">
                      {nextBestAction.skillName}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {nextBestAction.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                  {nextBestAction.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismissRecommendation(nextBestAction)}
                  className="text-xs font-semibold"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAcceptRecommendation(nextBestAction)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
                >
                  {nextBestAction.actionLabel} ↗
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid: Skill Performance Trends & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Performance Trends Matrix (2 Cols) */}
        <Card className="lg:col-span-2 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Skill Performance Trends & Score Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {trends.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">No skill trends analyzed yet.</div>
            ) : (
              <div className="space-y-4">
                {trends.map((item) => {
                  return (
                    <div
                      key={item.skillName}
                      className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                            {item.skillName}
                          </h4>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Current: {item.currentProficiency}% • Target: {item.targetProficiency}%
                          </span>
                        </div>

                        <Badge
                          variant={
                            item.trend === 'IMPROVING'
                              ? 'success'
                              : item.trend === 'DECLINING'
                              ? 'rose'
                              : item.trend === 'STABLE'
                              ? 'purple'
                              : 'secondary'
                          }
                          className="text-[10px] uppercase font-bold flex items-center gap-1"
                        >
                          {item.trend === 'IMPROVING' && <TrendingUp className="h-3 w-3" />}
                          {item.trend === 'DECLINING' && <TrendingDown className="h-3 w-3" />}
                          {item.trend === 'STABLE' && <Minus className="h-3 w-3" />}
                          {item.trend === 'INSUFFICIENT_DATA' && <HelpCircle className="h-3 w-3" />}
                          {item.trend.replace('_', ' ')}
                        </Badge>
                      </div>

                      <Progress value={item.currentProficiency} className="h-2" />

                      {/* Score History Trail */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">Assessment History:</span>
                          {item.scoreHistory && item.scoreHistory.length > 0 ? (
                            item.scoreHistory.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-800 dark:text-zinc-200 text-[10px]"
                              >
                                {s}%
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-400 italic text-[10px]">Unassessed</span>
                          )}
                        </div>

                        {item.changePoints !== 0 && (
                          <span
                            className={`font-extrabold ${
                              item.changePoints > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.changePoints > 0 ? `+${item.changePoints}%` : `${item.changePoints}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side Column: All Adaptive Recommendations & Analytics */}
        <div className="space-y-6">
          <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Adaptive Recommendations ({activeRecommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeRecommendations.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">No active recommendations.</div>
              ) : (
                activeRecommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <Badge
                        variant={
                          rec.priority === 'CRITICAL'
                            ? 'rose'
                            : rec.priority === 'HIGH'
                            ? 'purple'
                            : 'default'
                        }
                        className="text-[9px] uppercase font-bold py-0"
                      >
                        {rec.priority}
                      </Badge>

                      <Badge variant="outline" className="text-[9px] uppercase font-bold py-0">
                        {rec.type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="pt-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
                      <button
                        onClick={() => handleDismissRecommendation(rec)}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-600"
                      >
                        Dismiss
                      </button>

                      <Button
                        size="sm"
                        onClick={() => handleAcceptRecommendation(rec)}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] h-6 px-2.5"
                      >
                        {rec.actionLabel} ↗
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Improvements & Struggles Summary */}
          <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4 text-purple-600" />
                Adaptive Learning Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3" /> Recent Growth Areas
                </span>
                {improvingSkills.length > 0 ? (
                  <ul className="space-y-1 font-mono text-[11px]">
                    {improvingSkills.map((s) => (
                      <li key={s.skillName} className="flex justify-between">
                        <span>{s.skillName}</span>
                        <span className="text-emerald-600 font-bold">+{s.changePoints}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-400 italic text-[11px]">No skill gains recorded yet.</span>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-purple-600 flex items-center gap-1 mb-1">
                  <Target className="h-3 w-3" /> Primary Skill Gaps
                </span>
                {strugglingSkills.length > 0 ? (
                  <ul className="space-y-1 font-mono text-[11px]">
                    {strugglingSkills.slice(0, 3).map((s) => (
                      <li key={s.skillName} className="flex justify-between">
                        <span>{s.skillName}</span>
                        <span className="text-purple-600 font-bold">Gap: {s.gap}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-400 italic text-[11px]">No major skill gaps detected.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
