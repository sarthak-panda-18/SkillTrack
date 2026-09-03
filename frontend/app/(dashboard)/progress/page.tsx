'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Trophy,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  BookOpen,
  Calendar,
  RotateCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Award,
  Code,
} from 'lucide-react';
import { toast } from 'sonner';
import { progressService } from '@/services/progress.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { CareerReadinessData } from '@/types/progress';
import { useChartTheme } from '@/lib/hooks/useChartTheme';

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const chartTheme = useChartTheme();

  const { data, isLoading, error } = useQuery<CareerReadinessData>({
    queryKey: ['career-readiness'],
    queryFn: () => progressService.getStudentProgress(),
    staleTime: 5 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => progressService.refreshProgress(),
    onSuccess: (newData) => {
      queryClient.setQueryData(['career-readiness'], newData);
      toast.success('Career readiness index recalculated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to refresh progress analysis.');
    },
  });

  if (isLoading) {
    return (
      <PageWrapper className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-36 w-full rounded-sm bg-[#0A0A0A]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-28 rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-28 rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-28 rounded-sm bg-[#0A0A0A]" />
        </div>
        <Skeleton className="h-64 w-full rounded-sm bg-[#0A0A0A]" />
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
              <Target className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="text-2xl font-extrabold uppercase text-white">Target Career Role Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Please select a target career role in your profile to view progress analytics.'}
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
              <Brain className="h-8 w-8 text-[#FFD400]" />
            </div>
            <h2 className="text-2xl font-extrabold uppercase text-white">Skill Gap Analysis Required</h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              {errMsg || 'Run your Skill Gap Analysis first to calculate readiness metrics.'}
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

    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-sm bg-[#0A0A0A] border border-rose-500/40 text-white max-w-md mx-auto space-y-4 font-mono">
          <div className="h-16 w-16 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="text-2xl font-extrabold uppercase text-white">Career Readiness Intelligence Unavailable</h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {errMsg || 'An unexpected error occurred while calculating career readiness analytics.'}
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['career-readiness'] })}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const {
    careerRole,
    readinessScore = 0,
    readinessCategory,
    dimensions,
    biggestGaps = [],
    strongestSkills = [],
    skillImprovements = [],
    achievements = [],
    history = [],
    aiSummary,
    aiInsight,
    nextActionExplanation,
    isAiGenerated,
  } = data;

  const chartData = history.map((item) => ({
    date: new Date(item.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.readinessScore,
    skill: item.skillReadinessScore,
    assessment: item.assessmentReadinessScore,
  }));

  const formattedCategory = readinessCategory.replace('_', ' ');

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Tab Bar Links */}
      <div className="flex items-center justify-between gap-4 font-mono">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#FFD400]" />
            CAREER READINESS & SKILL GROWTH
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-surface-secondary border border-border p-1 rounded-sm shrink-0">
          <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase bg-[#FFD400] text-black">
            Career Readiness
          </button>
          <Link href="/progress/growth">
            <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              Skill Growth
            </button>
          </Link>
          <Link href="/progress/timeline">
            <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              Timeline
            </button>
          </Link>
        </div>
      </div>

      {/* Top Header Banner & Overall Score Gauge */}
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-xs font-bold text-[#FFD400] uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5 text-[#FFD400]" />
              CAREER READINESS INTELLIGENCE
            </span>
            <Badge variant="default" className="text-xs uppercase font-bold py-0.5 px-2.5 bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
              {formattedCategory}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white uppercase tracking-tight">
            Target Goal: {careerRole.name}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            {aiSummary}
          </p>
        </div>

        {/* Big Radial/Metric Readiness Gauge */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-sm bg-[#111111] border border-[#FFD400]/40 shrink-0 text-center space-y-1 font-mono">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Placement Readiness Score</span>
          <div className="text-5xl font-black text-[#FFD400]">
            {readinessScore}%
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <Button
              onClick={() => refreshMutation.mutate()}
              isLoading={refreshMutation.isPending}
              size="sm"
              variant="secondary"
              className="font-mono font-bold text-[11px] uppercase h-7 gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Refresh Analysis
            </Button>

            <Link href="/progress/growth">
              <Button
                size="sm"
                variant="primary"
                className="font-bold text-[11px] uppercase h-7 gap-1.5"
              >
                <TrendingUp className="h-3.5 w-3.5 text-black" />
                SKILL GROWTH
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Dimension Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <Card className="rounded-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase text-muted-foreground text-[10px] flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-[#FFD400]" /> Skill Readiness
              </span>
              <span className="font-bold text-[#FFD400] text-lg">
                {dimensions.skillReadiness}%
              </span>
            </div>
            <Progress value={dimensions.skillReadiness} className="h-1.5 bg-surface-secondary" />
            <span className="text-[10px] text-muted-foreground font-bold block">Weight: 35%</span>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase text-muted-foreground text-[10px] flex items-center gap-1">
                <Brain className="h-3.5 w-3.5 text-[#FFD400]" /> Assessments
              </span>
              <span className="font-bold text-[#FFD400] text-lg">
                {dimensions.assessmentPerformance}%
              </span>
            </div>
            <Progress value={dimensions.assessmentPerformance} className="h-1.5 bg-surface-secondary" />
            <span className="text-[10px] text-muted-foreground font-bold block">Weight: 25%</span>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase text-muted-foreground text-[10px] flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-[#FFD400]" /> Roadmap
              </span>
              <span className="font-bold text-[#FFD400] text-lg">
                {dimensions.roadmapProgress}%
              </span>
            </div>
            <Progress value={dimensions.roadmapProgress} className="h-1.5 bg-surface-secondary" />
            <span className="text-[10px] text-muted-foreground font-bold block">Weight: 25%</span>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase text-muted-foreground text-[10px] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#FFD400]" /> Study Consistency
              </span>
              <span className="font-bold text-[#FFD400] text-lg">
                {dimensions.studyConsistency}%
              </span>
            </div>
            <Progress value={dimensions.studyConsistency} className="h-1.5 bg-surface-secondary" />
            <span className="text-[10px] text-muted-foreground font-bold block">Weight: 15%</span>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight & Primary Next Action Box */}
      <Card className="border-2 border-[#FFD400]/40 rounded-sm">
        <CardContent className="p-6 space-y-4 font-sans">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2 font-mono">
                <Badge variant="default" className="text-[10px] uppercase font-bold bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#FFD400]" />
                  {isAiGenerated ? 'AI Readiness Coach' : 'Measured Intelligence'}
                </Badge>
              </div>
              <h3 className="text-2xl font-extrabold text-card-foreground uppercase leading-snug">
                {aiInsight}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-[#FFD400] font-mono uppercase">Recommended Step: </span>
                {nextActionExplanation}
              </p>
            </div>

            {biggestGaps.length > 0 && (
              <Link href="/skill-gap" className="shrink-0 font-mono">
                <Button variant="primary" className="font-bold text-xs uppercase gap-1.5">
                  Close Primary Gaps
                  <ArrowRight className="h-4 w-4 text-black" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recharts Career Readiness Historical Timeline */}
      <Card className="rounded-sm font-mono">
        <CardHeader className="p-6 pb-2 border-b border-border flex flex-row justify-between items-center">
          <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#FFD400]" />
            CAREER READINESS INDEX GROWTH TIMELINE
          </CardTitle>
          <span className="text-[11px] font-mono text-muted-foreground uppercase">Snapshots ({history.length})</span>
        </CardHeader>
        <CardContent className="p-6">
          {chartData.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground font-mono">
              Initial readiness snapshot recorded today. Historical trend data will accumulate as you complete learning goals.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD400" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FFD400" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTheme.secondaryTextColor }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: chartTheme.secondaryTextColor }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '2px',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Readiness Index"
                    stroke={chartTheme.primaryColor}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#readinessGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Biggest Gaps vs Strongest Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        {/* Biggest Skill Gaps */}
        <Card className="border-rose-500/40 rounded-sm">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <CardTitle className="text-xl font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-500 dark:text-rose-400" />
              PRIMARY SKILL GAPS RELATIVE TO ROLE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {biggestGaps.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground font-mono">No major skill gaps remaining!</div>
            ) : (
              biggestGaps.map((item) => (
                <div key={item.name} className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-card-foreground font-bold">{item.name}</span>
                    <span className="text-rose-500 dark:text-rose-400 font-bold">
                      Current: {item.currentProficiency}% / Target: {item.targetProficiency}%
                    </span>
                  </div>
                  <Progress value={item.currentProficiency} className="h-1.5 bg-surface-secondary" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Strongest Skills */}
        <Card className="border-[#FFD400]/40 rounded-sm">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <CardTitle className="text-xl font-bold text-[#FFD400] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#FFD400]" />
              STRONGEST TARGET CAREER SKILLS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {strongestSkills.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground font-mono">Work towards reaching 65%+ in target skills.</div>
            ) : (
              strongestSkills.map((item) => (
                <div key={item.name} className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-card-foreground font-bold">{item.name}</span>
                    <span className="text-[#FFD400] font-bold">
                      {item.currentProficiency}% Verified
                    </span>
                  </div>
                  <Progress value={item.currentProficiency} className="h-1.5 bg-surface-secondary" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Before vs After Skill Development Gains Table */}
      {skillImprovements.length > 0 && (
        <Card className="rounded-sm font-mono">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#FFD400]" />
              SKILL DEVELOPMENT — BEFORE VS AFTER GAINS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 font-sans">
              {skillImprovements.map((item) => (
                <div
                  key={item.skillName}
                  className="flex justify-between items-center p-3.5 rounded-sm border border-border bg-surface-secondary"
                >
                  <div className="space-y-0.5 font-mono">
                    <h4 className="font-bold text-base text-card-foreground uppercase">{item.skillName}</h4>
                    <span className="text-[11px] text-muted-foreground">
                      Baseline: {item.initialProficiency}% → Current: {item.currentProficiency}%
                    </span>
                  </div>
                  <Badge variant="default" className="font-mono font-extrabold text-xs bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                    +{item.changePoints} points
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlocked Milestones Gallery */}
      <Card className="rounded-sm font-mono">
        <CardHeader className="p-6 pb-3 border-b border-border">
          <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FFD400]" />
            CAREER ACHIEVEMENTS & MILESTONES UNLOCKED ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {achievements.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Complete your first skill assessment or roadmap topic to unlock milestones!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-sm bg-surface-secondary border border-border space-y-2 flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-sm bg-[#FFD400] text-black flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="h-5 w-5 text-black" />
                  </div>
                  <div className="space-y-0.5 min-w-0 font-sans">
                    <h4 className="font-bold text-base text-card-foreground uppercase">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-[#FFD400] font-mono block pt-1 uppercase">
                      Unlocked {new Date(item.unlockedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

