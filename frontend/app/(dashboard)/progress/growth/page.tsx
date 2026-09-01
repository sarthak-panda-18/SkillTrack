'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Calendar,
  Zap,
  ArrowRight,
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

export default function SkillGrowthPage() {
  const [timeRange, setTimeRange] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

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
        <Badge variant="success" className="text-[10px] font-extrabold gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-600" /> 📈 Improving
        </Badge>
      );
    }
    if (trend === 'DECLINING' || growthPoints < 0) {
      return (
        <Badge variant="rose" className="text-[10px] font-extrabold gap-1">
          <TrendingDown className="h-3 w-3 text-rose-600" /> 📉 Declining
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] font-extrabold gap-1">
        <Minus className="h-3 w-3 text-zinc-500" /> ➖ Stable
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ASSESSMENT':
        return <Badge variant="purple" className="text-[9px] uppercase font-black">Assessment</Badge>;
      case 'PROFILE':
        return <Badge variant="default" className="text-[9px] uppercase font-black">Profile</Badge>;
      case 'ADMIN':
        return <Badge variant="warning" className="text-[9px] uppercase font-black">Verified Admin</Badge>;
      case 'LEARNING':
        return <Badge variant="success" className="text-[9px] uppercase font-black">Learning</Badge>;
      default:
        return <Badge variant="secondary" className="text-[9px] uppercase font-black">System Baseline</Badge>;
    }
  };

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <TrendingUp className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            SKILL GROWTH
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            See how your technical skills have improved over time.
          </p>
        </div>

        {/* Top Tab Bar Links */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl shrink-0">
          <Link href="/progress">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
              Career Readiness
            </button>
          </Link>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs">
            Skill Growth
          </button>
          <Link href="/progress/timeline">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
              Timeline
            </button>
          </Link>
        </div>
      </div>

      {/* REFRESH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Clock className="h-4 w-4 text-zinc-400 shrink-0 mr-1" />
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                timeRange === opt.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category & Refresh */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-xs h-8"
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
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-center p-8 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Unable to load skill growth data.</h3>
            <p className="text-xs text-zinc-500 mt-1">Please check your connection and try again.</p>
          </div>
          <Button onClick={() => refetch()} className="bg-rose-600 text-white font-bold text-xs mx-auto">
            Retry
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.summary.totalSkills === 0 && !isLoading && !error && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center p-12 rounded-3xl space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
            <BarChart3 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              NO SKILL HISTORY YET
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Complete assessments or update your skills to start tracking your growth over time.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/assessment">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 rounded-xl">
                <Brain className="h-4 w-4" />
                Take Assessment
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="font-bold text-xs gap-2 rounded-xl">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {data.summary.totalSkills}
              </div>
              <div className="text-xs font-semibold text-zinc-500">Total Skills</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                <TrendingUp className="h-5 w-5" />
                {data.summary.improvingCount}
              </div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Improving</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-1">
                <Minus className="h-5 w-5" />
                {data.summary.stableCount}
              </div>
              <div className="text-xs font-semibold text-zinc-500">Stable</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200/80 dark:border-rose-950/60 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                <TrendingDown className="h-5 w-5" />
                {data.summary.decliningCount}
              </div>
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Declining</div>
            </div>
          </div>

          {/* HIGHLIGHTS GRID: MOST IMPROVED vs HIGHEST CURRENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Most Improved Skill */}
            <Card className="border-emerald-200/80 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  MOST IMPROVED SKILL
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {data.highlights.mostImproved ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                        {data.highlights.mostImproved.skillName}
                      </h3>
                      <Badge variant="success" className="font-mono font-black text-xs">
                        +{data.highlights.mostImproved.growthPoints} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Started at {data.highlights.mostImproved.initialProficiency}% → Currently at{' '}
                      <span className="font-bold text-emerald-600">{data.highlights.mostImproved.currentProficiency}%</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    No skills have recorded proficiency gains in this time period yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Highest Current Skill */}
            <Card className="border-indigo-200/80 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  HIGHEST CURRENT SKILL
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {data.highlights.highestCurrent ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                        {data.highlights.highestCurrent.skillName}
                      </h3>
                      <Badge variant="purple" className="font-mono font-black text-xs">
                        {data.highlights.highestCurrent.currentProficiency}%
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Category: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{data.highlights.highestCurrent.category}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No active skills recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* TARGET CAREER ROLE GAP ANALYSIS */}
          {data.careerRoleInfo && data.careerTargetGaps.length > 0 && (
            <Card className="border-amber-200/80 dark:border-amber-950/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs rounded-2xl">
              <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-900/40">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  Target Career Role Requirements ({data.careerRoleInfo.roleName})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.careerTargetGaps.map((gap) => (
                  <div
                    key={gap.skillId}
                    className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{gap.skillName}</span>
                      {gap.status === 'TARGET_REACHED' ? (
                        <Badge variant="success" className="text-[10px]">Target Reached</Badge>
                      ) : (
                        <Badge variant="rose" className="text-[10px]">Gap: {gap.gapPoints} pts</Badge>
                      )}
                    </div>
                    <Progress value={gap.currentProficiency} className="h-1.5" />
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                      <span>Current: {gap.currentProficiency}%</span>
                      <span>Target: {gap.targetProficiency}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SKILL CARDS WITH RECHARTS PROGRESSION LINES */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-600" />
              Technical Skill Growth Progression Cards ({data.skillCards.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {data.skillCards.map((card) => {
                  const trendBadge = getTrendBadge(card.trend, card.growthPoints);
                  const growthLabel =
                    card.growthPoints > 0
                      ? `+${card.growthPoints} pts`
                      : card.growthPoints < 0
                      ? `${card.growthPoints} pts`
                      : `0 pts`;

                  return (
                    <motion.div
                      key={card.skillId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
                        <CardHeader className="pb-3 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                              {card.category}
                            </span>
                            {trendBadge}
                          </div>

                          <div className="flex items-baseline justify-between">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                              {card.skillName}
                            </h3>
                            <div className="text-right font-mono">
                              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                {card.currentProficiency}%
                              </span>
                            </div>
                          </div>

                          {/* Numeric Started / Current / Growth */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 text-center border border-zinc-100 dark:border-zinc-800">
                            <div>
                              <div className="text-[10px] text-zinc-400 font-medium">Started</div>
                              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {card.initialProficiency}%
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-zinc-400 font-medium">Current</div>
                              <div className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                {card.currentProficiency}%
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] text-zinc-400 font-medium">Growth</div>
                              <div
                                className={`text-xs font-extrabold font-mono ${
                                  card.growthPoints > 0
                                    ? 'text-emerald-600'
                                    : card.growthPoints < 0
                                    ? 'text-rose-600'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {growthLabel}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3">
                          {/* Recharts Line Chart or Single Data Point Notice */}
                          {card.historyPoints.length > 1 ? (
                            <div className="h-32 w-full pt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={card.historyPoints}
                                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: '#18181b',
                                      borderColor: '#27272a',
                                      borderRadius: '8px',
                                      color: '#fff',
                                      fontSize: '11px',
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="proficiency"
                                    name="Proficiency %"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    dot={{ r: 3.5, fill: '#6366f1' }}
                                    activeDot={{ r: 5 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800 text-center space-y-1">
                              <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                Baseline: {card.currentProficiency}%
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                Not enough historical data yet.
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* CATEGORY ANALYSIS BREAKDOWN */}
          {data.categorySummaries.length > 0 && (
            <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  Category Level Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {data.categorySummaries.map((cat) => (
                  <div
                    key={cat.category}
                    className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{cat.category}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.skillCount} {cat.skillCount === 1 ? 'Skill' : 'Skills'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Avg Proficiency</span>
                        <span className="font-extrabold text-indigo-600">{cat.avgCurrentProficiency}%</span>
                      </div>
                      <Progress value={cat.avgCurrentProficiency} className="h-1.5" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                      <span>Avg Growth</span>
                      <span className={cat.avgGrowthPoints >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
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
            <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  Historical Skill Progression Log ({data.historyTimeline.length} Entries)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {data.historyTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                        <Code className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.skillName}</div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{new Date(item.recordedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getSourceBadge(item.source)}
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
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
