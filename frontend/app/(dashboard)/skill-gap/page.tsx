'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  Brain,
  Sparkles,
  AlertTriangle,
  RotateCw,
  ArrowRight,
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
import { SkillGapAnalysis } from '@/types/skillGap';

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
        <Skeleton className="h-28 w-full rounded-sm bg-[#0A0A0A]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-64 md:col-span-2 rounded-sm bg-[#0A0A0A]" />
        </div>
        <Skeleton className="h-96 w-full rounded-sm bg-[#0A0A0A]" />
      </PageWrapper>
    );
  }

  if (error || !analysis) {
    const errMsg = (error as any)?.response?.data?.message || 'No target career role selected.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
          <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <Target className="h-8 w-8 text-[#FFD400]" />
          </div>
          <h2 className="text-2xl font-extrabold uppercase text-white">Target Role Required</h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">{errMsg}</p>
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
    READY: { label: 'READY FOR ROLE', bg: 'bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]' },
    NEARLY_READY: { label: 'NEARLY READY', bg: 'bg-emerald-950/60 text-emerald-300 border-emerald-500' },
    DEVELOPING: { label: 'DEVELOPING', bg: 'bg-zinc-800 text-white border-white/20' },
    EARLY_STAGE: { label: 'EARLY STAGE', bg: 'bg-rose-950/60 text-rose-300 border-rose-500' },
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
      <div className="p-6 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <Target className="h-4 w-4 text-[#FFD400]" />
            SKILL GAP ANALYSIS ENGINE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase text-white tracking-tight flex items-center gap-3">
            {careerRoleName}
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Real-time evaluation against role requirements using assessment data and profile skills.
          </p>
        </div>

        <Button
          onClick={() => analyzeMutation.mutate()}
          isLoading={analyzeMutation.isPending}
          variant="secondary"
          className="relative z-10 font-mono font-bold text-xs uppercase gap-2 shrink-0"
        >
          <RotateCw className={`h-4 w-4 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
          Analyze My Skills
        </Button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        {/* Overall Readiness Ring Card */}
        <Card className="rounded-sm flex flex-col justify-between">
          <CardHeader className="p-6 pb-2 border-b border-border">
            <CardTitle className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-[#FFD400]" />
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
                  className="text-surface-secondary"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#FFD400"
                  strokeWidth="12"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * overallReadiness) / 100}
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeLinecap="square"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#FFD400]">
                  {overallReadiness}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Readiness</span>
              </div>
            </div>

            <Badge variant="default" className={`px-3 py-1 font-bold text-xs uppercase ${currentLabelInfo.bg}`}>
              {currentLabelInfo.label}
            </Badge>
          </CardContent>
        </Card>

        {/* AI Strategic Insights Card */}
        <Card className="md:col-span-2 rounded-sm">
          <CardHeader className="p-6 pb-2 border-b border-border flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#FFD400]" />
              AI STRATEGIC INSIGHTS & ADVISOR SUMMARY
            </CardTitle>
            <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
              Gemini AI
            </Badge>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs font-sans">
            <p className="text-foreground leading-relaxed font-medium bg-surface-secondary p-4 rounded-sm border border-border">
              {aiSummary}
            </p>

            {aiInsights.length > 0 && (
              <div className="space-y-2 font-mono">
                <h4 className="font-bold text-[#FFD400] text-xs uppercase">Key Priorities:</h4>
                <ul className="space-y-1.5 font-sans">
                  {aiInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-[#FFD400] shrink-0 mt-0.5" />
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
        <Card className="rounded-sm font-mono">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <CardTitle className="text-xl font-extrabold uppercase text-card-foreground flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FFD400]" />
              TOP RECOMMENDED FOCUS AREAS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topPriorities.slice(0, 3).map((item, idx) => (
              <div
                key={item.skillId}
                className="p-4 rounded-sm bg-surface-secondary border border-border space-y-2 relative font-sans"
              >
                <div className="flex justify-between items-start font-mono">
                  <span className="h-5 w-5 rounded-sm bg-[#FFD400] text-black font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge
                    variant="default"
                    className="text-[9px] py-0 font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
                  >
                    {item.priority}
                  </Badge>
                </div>
                <h4 className="font-bold text-lg text-card-foreground uppercase">{item.name}</h4>
                <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                  <span>Current: {item.currentProficiency}%</span>
                  <span className="font-bold text-[#FFD400]">Target: {item.recommendedProficiency}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skill Categories Tabs & Grids */}
      <div className="space-y-4 font-mono">
        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#FFD400] text-black font-extrabold'
                : 'bg-surface-secondary border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Skills ({skills.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'critical'
                ? 'bg-rose-600 text-white font-extrabold'
                : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
            }`}
          >
            🔴 Critical Gaps ({criticalGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('improvement')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'improvement'
                ? 'bg-amber-600 text-white font-extrabold'
                : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
            }`}
          >
            🟡 Needs Improvement ({needsImprovement.length})
          </button>
          <button
            onClick={() => setActiveTab('strong')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'strong'
                ? 'bg-emerald-600 text-white font-extrabold'
                : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            🟢 Strong Skills ({strongSkills.length})
          </button>
          <button
            onClick={() => setActiveTab('unassessed')}
            className={`px-4 py-2 rounded-sm text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'unassessed'
                ? 'bg-zinc-700 text-white font-extrabold'
                : 'bg-surface-secondary border border-border text-muted-foreground'
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
                className={`rounded-sm transition-all border ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : isStrong
                    ? 'border-[#FFD400]/40 bg-[#FFD400]/5'
                    : 'border-border'
                }`}
              >
                <CardContent className="p-5 space-y-3 font-sans">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-card-foreground uppercase">
                          {item.name}
                        </h3>
                        <Badge variant="default" className="text-[10px] py-0 font-mono bg-surface-secondary text-muted-foreground uppercase">
                          {item.category}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold font-mono">
                        Importance: {item.importance} • Source: {item.source}
                      </span>
                    </div>

                    <Badge
                      variant="default"
                      className="text-[10px] font-mono font-extrabold uppercase tracking-wider bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
                    >
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Benchmark Progress Bar */}
                  <div className="space-y-1 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Current: <strong className="text-card-foreground">{item.currentProficiency}%</strong>
                      </span>
                      <span className="text-[#FFD400] font-bold">
                        Target: {item.recommendedProficiency}%
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-sm bg-surface-secondary overflow-hidden relative">
                      <div
                        className={`h-full transition-all ${
                          isStrong
                            ? 'bg-[#FFD400]'
                            : isCritical
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.currentProficiency)}%` }}
                      />
                      {/* Recommended Target Indicator Line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
                        style={{ left: `${item.recommendedProficiency}%` }}
                        title={`Target: ${item.recommendedProficiency}%`}
                      />
                    </div>

                    {item.gap > 0 && (
                      <p className="text-[10px] text-rose-500 dark:text-rose-400 font-bold pt-0.5 flex items-center justify-end gap-1 uppercase">
                        <AlertTriangle className="h-3 w-3" />
                        Gap: {item.gap}% points below target
                      </p>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 flex justify-between items-center border-t border-border font-mono">
                    <span className="text-[10px] text-muted-foreground">
                      {item.latestAssessmentScore !== undefined
                        ? `Assessed: ${item.latestAssessmentScore}%`
                        : 'Not yet assessed'}
                    </span>

                    <Link href="/assessment">
                      <Button size="sm" variant="ghost" className="text-[#FFD400] hover:text-[#FFD400] text-xs font-bold gap-1 py-1 h-auto uppercase">
                        Take Assessment
                        <ArrowRight className="h-3 w-3 text-[#FFD400]" />
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
      <div className="p-6 rounded-sm bg-surface-secondary border border-[#FFD400]/40 text-card-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-2xl font-extrabold uppercase text-card-foreground">Ready to close these skill gaps?</h3>
          <p className="text-xs text-muted-foreground font-sans">
            Generate your personalized step-by-step learning roadmap tailored to your target career role.
          </p>
        </div>
        <Link href="/learning">
          <Button variant="primary" className="font-bold text-xs px-6 py-2.5 uppercase gap-2 shrink-0">
            Build My Learning Roadmap
            <ArrowRight className="h-4 w-4 text-black" />
          </Button>
        </Link>
      </div>
    </PageWrapper>
  );
}

