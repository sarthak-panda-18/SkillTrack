'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Zap,
  RotateCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Compass,
  Flame,
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

export default function ProgressPage() {
  const queryClient = useQueryClient();

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
        <Skeleton className="h-36 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
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
            <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
              <Target className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Target Career Role Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {errMsg || 'Please select a target career role in your profile to view progress and readiness metrics.'}
            </p>
            <Link href="/profile">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2">
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
            <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Skill Gap Analysis Required</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">{errMsg || 'Complete your Skill Gap Analysis first.'}</p>
            <Link href="/skill-gap">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2">
                Run Skill Gap Analysis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </PageWrapper>
      );
    }

    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Career Readiness Intelligence Unavailable</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            {errMsg || 'An unexpected error occurred while calculating career readiness analytics.'}
          </p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['career-readiness'] })}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2"
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
    unassessedSkills = [],
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

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'PLACEMENT_READY':
        return 'success';
      case 'NEARLY_READY':
        return 'purple';
      case 'PROGRESSING':
        return 'default';
      case 'DEVELOPING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formattedCategory = readinessCategory.replace('_', ' ');

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Tab Bar Links */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-600" />
            CAREER READINESS & SKILL GROWTH
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl shrink-0">
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs">
            Career Readiness
          </button>
          <Link href="/progress/growth">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
              Skill Growth
            </button>
          </Link>
          <Link href="/progress/timeline">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
              Timeline
            </button>
          </Link>
        </div>
      </div>

      {/* Top Header Banner & Overall Score Gauge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-indigo-800 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-amber-200 border border-white/10">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              Career Readiness Intelligence
            </span>
            <Badge variant={getCategoryBadgeVariant(readinessCategory)} className="text-xs uppercase font-black py-0.5 px-2.5">
              {formattedCategory}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Target Goal: {careerRole.name}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium">
            {aiSummary}
          </p>
        </div>

        {/* Big Radial/Metric Readiness Gauge */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider">Placement Readiness Score</span>
          <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {readinessScore}<span className="text-2xl text-amber-200">%</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <Button
              onClick={() => refreshMutation.mutate()}
              isLoading={refreshMutation.isPending}
              size="sm"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-bold text-[11px] h-7 gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Refresh Analysis
            </Button>

            <Link href="/progress/growth">
              <Button
                size="sm"
                className="bg-white text-indigo-900 hover:bg-amber-100 font-bold text-[11px] h-7 gap-1.5 shadow-sm"
              >
                <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />
                SKILL GROWTH
              </Button>
            </Link>
          </div>
        </div>
      </div>


      {/* 4 Dimension Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-zinc-500 text-[10px] tracking-wider flex items-center gap-1">
                <Code className="h-3.5 w-3.5 text-indigo-500" /> Skill Readiness
              </span>
              <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                {dimensions.skillReadiness}%
              </span>
            </div>
            <Progress value={dimensions.skillReadiness} className="h-2" />
            <span className="text-[10px] text-zinc-400 font-medium block">Weight: 35%</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-zinc-500 text-[10px] tracking-wider flex items-center gap-1">
                <Brain className="h-3.5 w-3.5 text-purple-500" /> Assessments
              </span>
              <span className="font-black text-purple-600 dark:text-purple-400 font-mono text-sm">
                {dimensions.assessmentPerformance}%
              </span>
            </div>
            <Progress value={dimensions.assessmentPerformance} className="h-2" />
            <span className="text-[10px] text-zinc-400 font-medium block">Weight: 25%</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-zinc-500 text-[10px] tracking-wider flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Roadmap
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                {dimensions.roadmapProgress}%
              </span>
            </div>
            <Progress value={dimensions.roadmapProgress} className="h-2" />
            <span className="text-[10px] text-zinc-400 font-medium block">Weight: 25%</span>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-zinc-500 text-[10px] tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> Study Consistency
              </span>
              <span className="font-black text-amber-600 dark:text-amber-400 font-mono text-sm">
                {dimensions.studyConsistency}%
              </span>
            </div>
            <Progress value={dimensions.studyConsistency} className="h-2" />
            <span className="text-[10px] text-zinc-400 font-medium block">Weight: 15%</span>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight & Primary Next Action Box */}
      <Card className="shadow-md border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-[10px] uppercase font-bold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {isAiGenerated ? 'AI Readiness Coach' : 'Measured Intelligence'}
                </Badge>
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-snug">
                {aiInsight}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <span className="font-bold text-amber-700 dark:text-amber-300">Recommended Step: </span>
                {nextActionExplanation}
              </p>
            </div>

            {biggestGaps.length > 0 && (
              <Link href="/skill-gap" className="shrink-0">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-sm">
                  Close Primary Gaps
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recharts Career Readiness Historical Timeline */}
      <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex flex-row justify-between items-center">
          <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            Career Readiness Index Growth Timeline
          </CardTitle>
          <span className="text-[11px] font-mono text-zinc-400">Historical Snapshots ({history.length})</span>
        </CardHeader>
        <CardContent className="p-6">
          {chartData.length === 0 ? (
            <div className="text-center py-10 text-xs text-zinc-500">
              Initial readiness snapshot recorded today. Historical trend data will accumulate as you complete learning goals.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Readiness Index"
                    stroke="#d97706"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Skill Gaps */}
        <Card className="shadow-sm border border-rose-200/80 dark:border-rose-950/60">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Target className="h-4 w-4" />
              Primary Skill Gaps Relative to Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {biggestGaps.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">No major skill gaps remaining!</div>
            ) : (
              biggestGaps.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">{item.name}</span>
                    <span className="text-rose-600 font-mono font-bold">
                      Current: {item.currentProficiency}% / Required: {item.targetProficiency}%
                    </span>
                  </div>
                  <Progress value={item.currentProficiency} className="h-2 bg-rose-100 dark:bg-rose-950" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Strongest Skills */}
        <Card className="shadow-sm border border-emerald-200/80 dark:border-emerald-950/60">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Strongest Target Career Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {strongestSkills.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">Work towards reaching 65%+ in target skills.</div>
            ) : (
              strongestSkills.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-900 dark:text-zinc-100 font-bold">{item.name}</span>
                    <span className="text-emerald-600 font-mono font-bold">
                      {item.currentProficiency}% Verified
                    </span>
                  </div>
                  <Progress value={item.currentProficiency} className="h-2 bg-emerald-100 dark:bg-emerald-950" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Before vs After Skill Development Gains Table */}
      {skillImprovements.length > 0 && (
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Skill Development — Before vs After Gains
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {skillImprovements.map((item) => (
                <div
                  key={item.skillName}
                  className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{item.skillName}</h4>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Baseline: {item.initialProficiency}% → Current: {item.currentProficiency}%
                    </span>
                  </div>
                  <Badge variant="success" className="font-mono font-extrabold text-xs">
                    +{item.changePoints} points
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlocked Milestones Gallery */}
      <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Career Achievements & Milestones Unlocked ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {achievements.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              Complete your first skill assessment or roadmap topic to unlock milestones!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2 flex items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-amber-600 font-mono block pt-1">
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
