'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
  Clock,
  Filter,
  RotateCw,
  AlertCircle,
  Brain,
  Award,
  Layers,
  Code,
  BarChart3,
  History,
} from 'lucide-react';
import { skillService } from '@/services/skill.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { SkillGrowthData } from '@/types/skillGrowth';

import { useChartTheme } from '@/lib/hooks/useChartTheme';

export default function SkillGrowthPage() {
  const [timeRange, setTimeRange] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const chartTheme = useChartTheme();

  const { data, isLoading, error, refetch, isFetching } = useQuery<SkillGrowthData>({
    queryKey: ['skill-growth', timeRange, categoryFilter],
    queryFn: () => skillService.getSkillGrowth({ timeRange, category: categoryFilter }),
    staleTime: 30 * 1000,
  });

  const timeRangeOptions = [
    { label: 'All Time', value: 'all' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
  ];

  const categoriesList = ['ALL', 'Programming', 'Web Development', 'Databases', 'Cloud', 'AI/Data', 'DevOps', 'DSA', 'Core CS'];

  const getTrendBadge = (trend: string, growthPoints: number) => {
    if (trend === 'IMPROVING' || growthPoints > 0) {
      return (
        <Badge variant="default" className="text-[10px] font-mono font-extrabold uppercase gap-1 bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
          <TrendingUp className="h-3 w-3 text-[#FFD400]" /> 📈 Improving
        </Badge>
      );
    }
    if (trend === 'DECLINING' || growthPoints < 0) {
      return (
        <Badge variant="default" className="text-[10px] font-mono font-extrabold uppercase gap-1 bg-rose-950 text-rose-300 border-rose-500/40">
          <TrendingDown className="h-3 w-3 text-rose-400" /> 📉 Declining
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="text-[10px] font-mono font-extrabold uppercase gap-1 bg-zinc-800 text-zinc-300">
        <Minus className="h-3 w-3 text-zinc-400" /> ➖ Stable
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ASSESSMENT':
        return <Badge variant="default" className="text-[9px] font-mono uppercase font-bold bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">Assessment</Badge>;
      case 'PROFILE':
        return <Badge variant="default" className="text-[9px] font-mono uppercase font-bold bg-zinc-800 text-white">Profile</Badge>;
      case 'ADMIN':
        return <Badge variant="default" className="text-[9px] font-mono uppercase font-bold bg-amber-950 text-amber-300 border-amber-500/40">Verified Admin</Badge>;
      case 'LEARNING':
        return <Badge variant="default" className="text-[9px] font-mono uppercase font-bold bg-emerald-950 text-emerald-300 border-emerald-500/40">Learning</Badge>;
      default:
        return <Badge variant="default" className="text-[9px] font-mono uppercase font-bold bg-zinc-800 text-zinc-400">System Baseline</Badge>;
    }
  };

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase flex items-center gap-2.5">
            <TrendingUp className="h-7 w-7 text-[#FFD400]" />
            SKILL GROWTH
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            See how your technical skills have improved over time.
          </p>
        </div>

        {/* Top Tab Bar Links */}
        <div className="flex items-center gap-2 bg-surface-secondary border border-border p-1 rounded-sm shrink-0">
          <Link href="/progress">
            <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              Career Readiness
            </button>
          </Link>
          <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase bg-[#FFD400] text-black">
            Skill Growth
          </button>
          <Link href="/progress/timeline">
            <button className="px-3 py-1.5 rounded-sm text-xs font-bold uppercase text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              Timeline
            </button>
          </Link>
        </div>
      </div>

      {/* REFRESH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-sm bg-surface-secondary border border-border font-mono">
        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                timeRange === opt.value
                  ? 'bg-[#FFD400] text-black font-extrabold'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-background border border-input text-xs font-mono font-bold text-foreground rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-[#FFD400]"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-xs h-8 uppercase"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-sm bg-surface-secondary" />
            <Skeleton className="h-24 rounded-sm bg-surface-secondary" />
            <Skeleton className="h-24 rounded-sm bg-surface-secondary" />
            <Skeleton className="h-24 rounded-sm bg-surface-secondary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-sm bg-surface-secondary" />
            <Skeleton className="h-64 rounded-sm bg-surface-secondary" />
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-500/40 text-center p-8 rounded-sm space-y-4 max-w-md mx-auto font-mono">
          <div className="h-12 w-12 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-card-foreground">Unable to load skill growth data.</h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Please check your connection and try again.</p>
          </div>
          <Button onClick={() => refetch()} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase mx-auto">
            Retry
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.summary.totalSkills === 0 && !isLoading && !error && (
        <Card className="text-center p-12 rounded-sm space-y-4 max-w-lg mx-auto font-mono">
          <div className="h-16 w-16 rounded-sm bg-surface-secondary text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <BarChart3 className="h-8 w-8 text-[#FFD400]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-card-foreground uppercase tracking-tight">
              NO SKILL HISTORY YET
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto font-sans">
              Complete assessments or update your skills to start tracking your growth over time.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2 font-mono">
            <Link href="/assessment">
              <Button variant="primary" className="font-bold text-xs uppercase gap-2">
                <Brain className="h-4 w-4 text-black" />
                Take Assessment
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" className="font-bold text-xs uppercase gap-2">
                Add Skills to Profile
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* MAIN DASHBOARD CONTENT */}
      {data && data.summary.totalSkills > 0 && !isLoading && (
        <div className="space-y-8">
          {/* METRIC SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
              <div className="text-3xl font-black text-card-foreground">
                {data.summary.totalSkills}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Total Skills</div>
            </div>

            <div className="p-4 rounded-sm bg-surface-secondary border border-[#FFD400]/40 text-center space-y-1">
              <div className="text-3xl font-black text-[#FFD400] flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5 text-[#FFD400]" />
                {data.summary.improvingCount}
              </div>
              <div className="text-xs font-bold text-[#FFD400] uppercase">Improving</div>
            </div>

            <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
              <div className="text-3xl font-black text-muted-foreground flex items-center justify-center gap-1">
                <Minus className="h-5 w-5 text-muted-foreground" />
                {data.summary.stableCount}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Stable</div>
            </div>

            <div className="p-4 rounded-sm bg-surface-secondary border border-rose-500/40 text-center space-y-1">
              <div className="text-3xl font-black text-rose-500 dark:text-rose-400 flex items-center justify-center gap-1">
                <TrendingDown className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                {data.summary.decliningCount}
              </div>
              <div className="text-xs font-bold text-rose-500 dark:text-rose-400 uppercase">Declining</div>
            </div>
          </div>

          {/* HIGHLIGHTS GRID: MOST IMPROVED vs HIGHEST CURRENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* Most Improved Skill */}
            <Card className="border-[#FFD400]/40 rounded-sm">
              <CardHeader className="p-6 pb-2 border-b border-border">
                <CardTitle className="text-xl font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#FFD400]" />
                  MOST IMPROVED SKILL
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 space-y-3 font-sans">
                {data.highlights.mostImproved ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-2xl text-card-foreground uppercase">
                        {data.highlights.mostImproved.skillName}
                      </h3>
                      <Badge variant="default" className="font-mono font-extrabold text-xs bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                        +{data.highlights.mostImproved.growthPoints} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Started at {data.highlights.mostImproved.initialProficiency}% → Currently at{' '}
                      <span className="font-bold text-[#FFD400]">{data.highlights.mostImproved.currentProficiency}%</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">
                    No skills have recorded proficiency gains in this time period yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Highest Current Skill */}
            <Card className="rounded-sm">
              <CardHeader className="p-6 pb-2 border-b border-border">
                <CardTitle className="text-xl font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FFD400]" />
                  HIGHEST CURRENT SKILL
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-3 space-y-3 font-sans">
                {data.highlights.highestCurrent ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-2xl text-card-foreground uppercase">
                        {data.highlights.highestCurrent.skillName}
                      </h3>
                      <Badge variant="default" className="font-mono font-extrabold text-xs bg-surface-secondary text-card-foreground">
                        {data.highlights.highestCurrent.currentProficiency}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      Category: <span className="font-bold text-card-foreground">{data.highlights.highestCurrent.category}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">No active skills recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* TARGET CAREER ROLE GAP ANALYSIS */}
          {data.careerRoleInfo && data.careerTargetGaps.length > 0 && (
            <Card className="border-[#FFD400]/40 rounded-sm font-mono">
              <CardHeader className="p-6 pb-3 border-b border-border">
                <CardTitle className="text-xl font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#FFD400]" />
                  TARGET CAREER ROLE REQUIREMENTS ({data.careerRoleInfo.roleName})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.careerTargetGaps.map((gap) => (
                  <div
                    key={gap.skillId}
                    className="p-3 rounded-sm bg-surface-secondary border border-border space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-card-foreground">{gap.skillName}</span>
                      {gap.status === 'TARGET_REACHED' ? (
                        <Badge variant="default" className="text-[10px] bg-[#FFD400]/20 text-[#FFD400]">Target Reached</Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] bg-rose-950 text-rose-300">Gap: {gap.gapPoints} pts</Badge>
                      )}
                    </div>
                    <Progress value={gap.currentProficiency} className="h-1.5 bg-background" />
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                      <span>Current: {gap.currentProficiency}%</span>
                      <span>Target: {gap.targetProficiency}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SKILL CARDS WITH RECHARTS PROGRESSION LINES */}
          <div className="space-y-4 font-mono">
            <h2 className="text-2xl font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <Code className="h-5 w-5 text-[#FFD400]" />
              TECHNICAL SKILL GROWTH PROGRESSION CARDS ({data.skillCards.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.skillCards.map((card) => {
                const trendBadge = getTrendBadge(card.trend, card.growthPoints);
                const growthLabel =
                  card.growthPoints > 0
                    ? `+${card.growthPoints} pts`
                    : card.growthPoints < 0
                    ? `${card.growthPoints} pts`
                    : `0 pts`;

                return (
                  <Card key={card.skillId} className="rounded-sm flex flex-col justify-between">
                    <CardHeader className="p-5 pb-3 space-y-2 font-mono">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-surface-secondary text-muted-foreground border border-border">
                          {card.category}
                        </span>
                        {trendBadge}
                      </div>

                      <div className="flex items-baseline justify-between">
                        <h3 className="font-bold text-2xl text-card-foreground uppercase">
                          {card.skillName}
                        </h3>
                        <div className="text-right font-mono">
                          <span className="text-2xl font-black text-[#FFD400]">
                            {card.currentProficiency}%
                          </span>
                        </div>
                      </div>

                      {/* Numeric Started / Current / Growth */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-sm bg-surface-secondary border border-border text-center font-mono">
                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase">Started</div>
                          <div className="text-xs font-bold text-card-foreground">
                            {card.initialProficiency}%
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase">Current</div>
                          <div className="text-xs font-extrabold text-[#FFD400]">
                            {card.currentProficiency}%
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase">Growth</div>
                          <div
                            className={`text-xs font-extrabold font-mono ${
                              card.growthPoints > 0
                                ? 'text-[#FFD400]'
                                : card.growthPoints < 0
                                ? 'text-rose-500 dark:text-rose-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {growthLabel}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3 font-mono">
                      {/* Recharts Line Chart or Single Data Point Notice */}
                      {card.historyPoints.length > 1 ? (
                        <div className="h-32 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={card.historyPoints}
                              margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                              <XAxis dataKey="date" tick={{ fontSize: 10, fill: chartTheme.secondaryTextColor }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: chartTheme.secondaryTextColor }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: chartTheme.tooltipBg,
                                  borderColor: chartTheme.tooltipBorder,
                                  borderRadius: '2px',
                                  color: chartTheme.tooltipText,
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="proficiency"
                                name="Proficiency %"
                                stroke={chartTheme.primaryColor}
                                strokeWidth={2.5}
                                dot={{ r: 3.5, fill: chartTheme.primaryColor }}
                                activeDot={{ r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="p-3 rounded-sm bg-surface-secondary border border-border text-center space-y-1 font-mono">
                          <div className="text-xs font-bold text-card-foreground uppercase">
                            Baseline: {card.currentProficiency}%
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Not enough historical data yet.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CATEGORY ANALYSIS BREAKDOWN */}
          {data.categorySummaries.length > 0 && (
            <Card className="rounded-sm font-mono">
              <CardHeader className="p-6 pb-3 border-b border-border">
                <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#FFD400]" />
                  CATEGORY LEVEL PERFORMANCE ANALYSIS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.categorySummaries.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3.5 rounded-sm border border-border bg-surface-secondary space-y-2 font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-card-foreground uppercase">{cat.category}</span>
                      <Badge variant="default" className="text-[10px] bg-background text-muted-foreground">
                        {cat.skillCount} {cat.skillCount === 1 ? 'Skill' : 'Skills'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Avg Proficiency</span>
                        <span className="font-bold text-[#FFD400]">{cat.avgCurrentProficiency}%</span>
                      </div>
                      <Progress value={cat.avgCurrentProficiency} className="h-1.5 bg-background" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                      <span>Avg Growth</span>
                      <span className={cat.avgGrowthPoints >= 0 ? 'text-[#FFD400] font-bold' : 'text-rose-500 dark:text-rose-400 font-bold'}>
                        {cat.avgGrowthPoints >= 0 ? `+${cat.avgGrowthPoints}` : cat.avgGrowthPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SKILL HISTORY TIMELINE LOG */}
          {data.historyTimeline.length > 0 && (
            <Card className="rounded-sm font-mono">
              <CardHeader className="p-6 pb-3 border-b border-border">
                <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
                  <History className="h-5 w-5 text-[#FFD400]" />
                  HISTORICAL SKILL PROGRESSION LOG ({data.historyTimeline.length} ENTRIES)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {data.historyTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-sm border border-border bg-surface-secondary flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-sm bg-[#FFD400] text-black flex items-center justify-center shrink-0">
                        <Code className="h-4 w-4 text-black" />
                      </div>
                      <div>
                        <div className="font-bold text-card-foreground uppercase">{item.skillName}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2 mt-0.5 font-sans">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{new Date(item.recordedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getSourceBadge(item.source)}
                      <span className="font-extrabold text-[#FFD400] text-lg">
                        {item.proficiency}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

