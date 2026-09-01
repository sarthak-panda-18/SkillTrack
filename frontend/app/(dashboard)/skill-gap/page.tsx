'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Brain,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  ArrowRight,
  BookOpen,
  Zap,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { skillGapService } from '@/services/skillGap.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { SkillGapAnalysis, EvaluatedSkill } from '@/types/skillGap';

export default function SkillGapPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'improvement' | 'strong' | 'unassessed'>('all');

  const { data: analysis, isLoading, error } = useQuery<SkillGapAnalysis>({
    queryKey: ['skill-gap-analysis'],
    queryFn: () => skillGapService.getStudentSkillGap(),
    staleTime: 5 * 60 * 1000,
  });

  const analyzeMutation = useMutation({
    mutationFn: () => skillGapService.recalculateSkillGap(),
    onSuccess: (data) => {
      queryClient.setQueryData(['skill-gap-analysis'], data);
      toast.success('Skill Gap Analysis updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to recalculate skill gap analysis.');
    },
  });

  if (isLoading) {
    return (
      <PageWrapper className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 md:col-span-2 rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </PageWrapper>
    );
  }

  if (error || !analysis) {
    const errMsg = (error as any)?.response?.data?.message || 'No target career role selected.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
            <Target className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Target Role Required</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">{errMsg}</p>
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

  const {
    careerRoleName,
    overallReadiness,
    readinessLabel,
    skills = [],
    criticalGaps = [],
    needsImprovement = [],
    strongSkills = [],
    unassessedSkills = [],
    topPriorities = [],
    aiSummary,
    aiInsights = [],
  } = analysis;

  const labelBadgeMap = {
    READY: { label: 'READY FOR ROLE', variant: 'success' as const, bg: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
    NEARLY_READY: { label: 'NEARLY READY', variant: 'blue' as const, bg: 'bg-blue-50 text-blue-700 border-blue-300' },
    DEVELOPING: { label: 'DEVELOPING', variant: 'warning' as const, bg: 'bg-amber-50 text-amber-700 border-amber-300' },
    EARLY_STAGE: { label: 'EARLY STAGE', variant: 'rose' as const, bg: 'bg-rose-50 text-rose-700 border-rose-300' },
  };

  const currentLabelInfo = labelBadgeMap[readinessLabel] || labelBadgeMap.DEVELOPING;

  // Filter skills by active tab
  const displayedSkills =
    activeTab === 'critical'
      ? criticalGaps
      : activeTab === 'improvement'
      ? needsImprovement
      : activeTab === 'strong'
      ? strongSkills
      : activeTab === 'unassessed'
      ? unassessedSkills
      : skills;

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Target className="h-4 w-4" />
            Skill Gap Analysis Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            {careerRoleName}
          </h1>
          <p className="text-xs text-purple-200">
            Real-time evaluation against role requirements using assessment data and profile skills.
          </p>
        </div>

        <Button
          onClick={() => analyzeMutation.mutate()}
          isLoading={analyzeMutation.isPending}
          variant="outline"
          className="relative z-10 border-purple-400/30 text-white hover:bg-white/10 gap-2 font-bold text-xs shrink-0"
        >
          <RotateCw className={`h-4 w-4 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
          Analyze My Skills
        </Button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Readiness Ring Card */}
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Career Skill Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-zinc-100 dark:text-zinc-800"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * overallReadiness) / 100}
                  className="text-purple-600 transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {overallReadiness}%
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Readiness</span>
              </div>
            </div>

            <Badge variant={currentLabelInfo.variant} className="px-3 py-1 font-bold text-xs tracking-wider">
              {currentLabelInfo.label}
            </Badge>
          </CardContent>
        </Card>

        {/* AI Strategic Insights Card */}
        <Card className="md:col-span-2 shadow-sm border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-purple-50/30 dark:from-zinc-900 dark:to-purple-950/20">
          <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-row justify-between items-center">
            <CardTitle className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              AI Strategic Insights & Advisor Summary
            </CardTitle>
            <Badge variant="purple" className="text-[10px] font-bold">
              Gemini AI
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium bg-purple-50/50 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50">
              {aiSummary}
            </p>

            {aiInsights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">Key Priorities:</h4>
                <ul className="space-y-1.5">
                  {aiInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Priorities Section */}
      {topPriorities.length > 0 && (
        <Card className="shadow-sm border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-zinc-900">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Top Recommended Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topPriorities.slice(0, 3).map((item, idx) => (
              <div
                key={item.skillId}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <span className="h-5 w-5 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge
                    variant={item.priority === 'CRITICAL' ? 'rose' : item.priority === 'HIGH' ? 'warning' : 'purple'}
                    className="text-[9px] py-0 font-bold"
                  >
                    {item.priority}
                  </Badge>
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</h4>
                <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                  <span>Current: {item.currentProficiency}%</span>
                  <span className="font-bold text-purple-600">Target: {item.recommendedProficiency}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skill Categories Tabs & Grids */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All Skills ({skills.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
            }`}
          >
            🔴 Critical Gaps ({criticalGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('improvement')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'improvement'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            🟡 Needs Improvement ({needsImprovement.length})
          </button>
          <button
            onClick={() => setActiveTab('strong')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'strong'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            🟢 Strong Skills ({strongSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('unassessed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'unassessed'
                ? 'bg-zinc-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            ⚪ Unassessed ({unassessedSkills.length})
          </button>
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedSkills.map((item) => {
            const isCritical = item.status === 'CRITICAL_GAP' || (item.status === 'UNASSESSED' && item.importance === 'CRITICAL');
            const isStrong = item.status === 'STRONG';

            return (
              <Card
                key={item.skillId}
                className={`shadow-xs transition-all border ${
                  isCritical
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                    : isStrong
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </h3>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold font-mono">
                        Importance: {item.importance} • Source: {item.source}
                      </span>
                    </div>

                    <Badge
                      variant={
                        item.status === 'STRONG'
                          ? 'success'
                          : item.status === 'NEEDS_IMPROVEMENT'
                          ? 'warning'
                          : item.status === 'CRITICAL_GAP'
                          ? 'rose'
                          : 'secondary'
                      }
                      className="text-[10px] font-extrabold uppercase tracking-wider"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Benchmark Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Current: <strong className="text-zinc-900 dark:text-zinc-100">{item.currentProficiency}%</strong>
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        Target: {item.recommendedProficiency}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isStrong
                            ? 'bg-emerald-500'
                            : isCritical
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.currentProficiency)}%` }}
                      />
                      {/* Recommended Target Indicator Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-purple-600 z-10"
                        style={{ left: `${item.recommendedProficiency}%` }}
                        title={`Target: ${item.recommendedProficiency}%`}
                      />
                    </div>

                    {item.gap > 0 && (
                      <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold pt-0.5 flex items-center justify-end gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Gap: {item.gap}% points below target
                      </p>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[10px] text-zinc-400">
                      {item.latestAssessmentScore !== undefined
                        ? `Assessed: ${item.latestAssessmentScore}%`
                        : 'Not yet assessed'}
                    </span>

                    <Link href="/assessment">
                      <Button size="sm" variant="ghost" className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 text-xs font-bold gap-1 py-1 h-auto">
                        Take Assessment
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-white">Ready to close these skill gaps?</h3>
          <p className="text-xs text-purple-100">
            Generate your personalized step-by-step learning roadmap tailored to your target career role.
          </p>
        </div>
        <Link href="/learning">
          <Button className="bg-white text-purple-900 hover:bg-purple-50 font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md gap-2 shrink-0">
            Build My Learning Roadmap
            <ArrowRight className="h-4 w-4 text-purple-900" />
          </Button>
        </Link>
      </div>
    </PageWrapper>
  );
}
