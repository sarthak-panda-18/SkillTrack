'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  AlertCircle,
  RotateCw,
  Zap,
  Target,
  ArrowRight,
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
import { AdaptiveLearningState, AdaptiveRecommendation } from '@/types/adaptive';

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
        <Skeleton className="h-28 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-44 w-full rounded-sm bg-[#0A0A0A]" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
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
          <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
            <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
              <Brain className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Target Career Role Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Please select a target career role in your profile to activate Adaptive Intelligence.'}
            </p>
            <Link href="/profile">
              <Button className="w-full bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2">
                Select Target Career Role
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'SKILL_GAP_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
            <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
              <Target className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Skill Gap Analysis Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Complete your Skill Gap Analysis first.'}
            </p>
            <Link href="/skill-gap">
              <Button className="w-full bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2">
                Run Skill Gap Analysis
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'ROADMAP_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
            <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
              <Layers className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Personalized Roadmap Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Generate your personalized learning roadmap first.'}
            </p>
            <Link href="/learning">
              <Button className="w-full bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2">
                Generate Learning Roadmap
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    if (errCode === 'STUDY_PLAN_REQUIRED') {
      return (
        <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
          <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
            <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
              <Sparkles className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Study Plan Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Generate your personalized study plan first.'}
            </p>
            <Link href="/study-plan">
              <Button className="w-full bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2">
                Generate Study Plan
                <ArrowRight className="h-4 w-4 text-black" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    // Default Error UI
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-sm bg-[#0A0A0A] border border-rose-500/40 text-white max-w-md mx-auto space-y-4 font-mono">
          <div className="h-16 w-16 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Adaptive Intelligence Temporarily Unavailable</h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {errMsg || 'An unexpected error occurred while generating your adaptive learning intelligence.'}
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['adaptive-learning'] })}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase gap-2"
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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-xs font-bold text-[#FFD400] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD400]" />
              ADAPTIVE INTELLIGENCE ENGINE
            </span>
            {estimatedLearningVelocity > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-sm bg-[#FFD400]/10 text-[#FFD400] text-xs font-bold border border-[#FFD400]/40 uppercase">
                <Zap className="h-3.5 w-3.5 text-[#FFD400] fill-[#FFD400]" />
                +{estimatedLearningVelocity} pts / wk Velocity
              </span>
            )}
          </div>

          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            ADAPTIVE LEARNING PATHWAY FOR {careerRoleName}
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">{aiSummary}</p>
        </div>

        <Button
          onClick={() => analyzeMutation.mutate()}
          isLoading={analyzeMutation.isPending}
          variant="outline"
          className="relative z-10 border-white/20 text-white font-mono font-bold text-xs uppercase hover:border-[#FFD400] gap-2 shrink-0"
        >
          <RotateCw className="h-4 w-4" />
          Analyze Latest Progress
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              Skills Analyzed
            </span>
            <div className="font-condensed text-3xl font-black text-white">
              {skillsAnalyzedCount}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans block">Target Role Skills</span>
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-[#FFD400] uppercase font-bold tracking-wider block flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#FFD400]" /> Improving
            </span>
            <div className="font-condensed text-3xl font-black text-[#FFD400]">
              {improvingCount}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans block">Positive Score Growth</span>
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block flex items-center gap-1">
              <Minus className="h-3.5 w-3.5 text-zinc-400" /> Stable / Baseline
            </span>
            <div className="font-condensed text-3xl font-black text-white">
              {stableCount + insufficientDataCount}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans block">Consistent Proficiency</span>
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] text-[#FFD400] uppercase font-bold tracking-wider block flex items-center gap-1">
              <Target className="h-3.5 w-3.5 text-[#FFD400]" /> Study Consistency
            </span>
            <div className="font-condensed text-3xl font-black text-[#FFD400]">
              {studyConsistencyPercentage}%
            </div>
            <span className="text-[11px] text-zinc-400 font-sans block">Plan Execution Rate</span>
          </CardContent>
        </Card>
      </div>

      {/* Highlighted Next Best Action Card */}
      {nextBestAction && (
        <Card className="bg-[#0A0A0A] border-2 border-[#FFD400]/60 text-white rounded-sm">
          <CardHeader className="p-6 pb-2 border-b border-white/10 flex flex-row justify-between items-center">
            <CardTitle className="font-condensed text-xl font-extrabold uppercase text-[#FFD400] flex items-center gap-2">
              <Compass className="h-5 w-5 text-[#FFD400]" />
              PRIMARY NEXT BEST ACTION
            </CardTitle>
            <Badge
              variant="default"
              className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]"
            >
              {nextBestAction.priority} PRIORITY
            </Badge>
          </CardHeader>

          <CardContent className="p-6 space-y-4 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <Badge variant="default" className="text-[10px] uppercase font-bold bg-zinc-800 text-white">
                    {nextBestAction.type.replace('_', ' ')}
                  </Badge>
                  {nextBestAction.skillName && (
                    <Badge variant="default" className="text-[10px] font-bold bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
                      {nextBestAction.skillName}
                    </Badge>
                  )}
                </div>
                <h3 className="font-condensed text-2xl font-extrabold text-white uppercase">
                  {nextBestAction.title}
                </h3>
                <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                  {nextBestAction.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismissRecommendation(nextBestAction)}
                  className="text-xs font-bold uppercase border-white/20 text-white"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAcceptRecommendation(nextBestAction)}
                  className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5"
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
        <Card className="lg:col-span-2 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
          <CardHeader className="p-6 pb-3 border-b border-white/10">
            <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#FFD400]" />
              SKILL PERFORMANCE TRENDS & SCORE TRAJECTORY
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {trends.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400 font-mono">No skill trends analyzed yet.</div>
            ) : (
              <div className="space-y-4">
                {trends.map((item) => {
                  return (
                    <div
                      key={item.skillName}
                      className="p-4 rounded-sm border border-white/10 bg-[#111111] space-y-3 font-sans"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h4 className="font-condensed font-bold text-lg text-white uppercase">
                            {item.skillName}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            Current: {item.currentProficiency}% • Target: {item.targetProficiency}%
                          </span>
                        </div>

                        <Badge
                          variant="default"
                          className="text-[10px] font-mono font-bold uppercase flex items-center gap-1 bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
                        >
                          {item.trend === 'IMPROVING' && <TrendingUp className="h-3 w-3 text-[#FFD400]" />}
                          {item.trend === 'DECLINING' && <TrendingDown className="h-3 w-3 text-rose-400" />}
                          {item.trend === 'STABLE' && <Minus className="h-3 w-3 text-white" />}
                          {item.trend === 'INSUFFICIENT_DATA' && <HelpCircle className="h-3 w-3 text-zinc-400" />}
                          {item.trend.replace('_', ' ')}
                        </Badge>
                      </div>

                      <Progress value={item.currentProficiency} className="h-1.5 bg-zinc-800" />

                      {/* Score History Trail */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase">Assessment History:</span>
                          {item.scoreHistory && item.scoreHistory.length > 0 ? (
                            item.scoreHistory.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-black font-bold text-white text-[10px]"
                              >
                                {s}%
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500 italic text-[10px]">Unassessed</span>
                          )}
                        </div>

                        {item.changePoints !== 0 && (
                          <span
                            className={`font-extrabold ${
                              item.changePoints > 0 ? 'text-[#FFD400]' : 'text-rose-400'
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
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
            <CardHeader className="p-6 pb-3 border-b border-white/10">
              <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-[#FFD400]" />
                ADAPTIVE RECOMMENDATIONS ({activeRecommendations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 font-sans">
              {activeRecommendations.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400 font-mono">No active recommendations.</div>
              ) : (
                activeRecommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3.5 rounded-sm border border-white/10 bg-[#111111] space-y-2"
                  >
                    <div className="flex justify-between items-start gap-1 font-mono">
                      <Badge
                        variant="default"
                        className="text-[9px] uppercase font-bold py-0 bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
                      >
                        {rec.priority}
                      </Badge>

                      <Badge variant="default" className="text-[9px] uppercase font-bold py-0 bg-zinc-800 text-white">
                        {rec.type.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h4 className="font-condensed font-bold text-base text-white leading-snug uppercase">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="pt-2 flex justify-between items-center border-t border-white/10 font-mono">
                      <button
                        onClick={() => handleDismissRecommendation(rec)}
                        className="text-[10px] font-bold uppercase text-zinc-500 hover:text-white"
                      >
                        Dismiss
                      </button>

                      <Button
                        size="sm"
                        onClick={() => handleAcceptRecommendation(rec)}
                        className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-[10px] uppercase h-6 px-2.5"
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
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm font-mono">
            <CardHeader className="p-6 pb-2 border-b border-white/10">
              <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#FFD400]" />
                ADAPTIVE LEARNING BREAKDOWN
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#FFD400] flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-[#FFD400]" /> Recent Growth Areas
                </span>
                {improvingSkills.length > 0 ? (
                  <ul className="space-y-1 font-mono text-[11px]">
                    {improvingSkills.map((s) => (
                      <li key={s.skillName} className="flex justify-between">
                        <span className="text-zinc-300">{s.skillName}</span>
                        <span className="text-[#FFD400] font-bold">+{s.changePoints}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-500 italic text-[11px]">No skill gains recorded yet.</span>
                )}
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase text-rose-400 flex items-center gap-1 mb-1">
                  <Target className="h-3 w-3 text-rose-400" /> Primary Skill Gaps
                </span>
                {strugglingSkills.length > 0 ? (
                  <ul className="space-y-1 font-mono text-[11px]">
                    {strugglingSkills.slice(0, 3).map((s) => (
                      <li key={s.skillName} className="flex justify-between">
                        <span className="text-zinc-300">{s.skillName}</span>
                        <span className="text-rose-400 font-bold">Gap: {s.gap}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-zinc-500 italic text-[11px]">No major skill gaps detected.</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

