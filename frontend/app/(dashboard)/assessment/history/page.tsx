'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  ArrowRight,
  Eye,
  X,
  Target,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { assessmentService } from '@/services/assessment.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { AssessmentHistoryData, AssessmentAttemptHistoryItem } from '@/types/assessmentHistory';
import { useChartTheme } from '@/lib/hooks/useChartTheme';

export default function AssessmentHistoryPage() {
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [sort, setSort] = useState<string>('latest');
  const [page, setPage] = useState<number>(1);
  const [selectedAttempt, setSelectedAttempt] = useState<AssessmentAttemptHistoryItem | null>(null);
  const chartTheme = useChartTheme();

  const { data, isLoading, error, refetch, isFetching } = useQuery<AssessmentHistoryData>({
    queryKey: ['assessmentHistory', search, timeRange, sort, page],
    queryFn: () =>
      assessmentService.getUserAttemptHistory({
        search,
        timeRange,
        sort,
        page,
        limit: 10,
      }),
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

  const getProficiencyBadge = (proficiency: string) => {
    switch (proficiency) {
      case 'ADVANCED':
        return <Badge variant="success" className="text-[10px] font-black uppercase">Advanced</Badge>;
      case 'INTERMEDIATE':
        return <Badge variant="purple" className="text-[10px] font-black uppercase">Intermediate</Badge>;
      default:
        return <Badge variant="warning" className="text-[10px] font-black uppercase">Beginner</Badge>;
    }
  };

  const getImprovementBadge = (improvementPoints: number | null) => {
    if (improvementPoints === null) {
      return (
        <Badge variant="secondary" className="text-[10px] font-extrabold text-zinc-500">
          First Attempt
        </Badge>
      );
    }
    if (improvementPoints > 0) {
      return (
        <Badge variant="success" className="text-[10px] font-black gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-600" />
          +{improvementPoints} pts
        </Badge>
      );
    }
    if (improvementPoints < 0) {
      return (
        <Badge variant="rose" className="text-[10px] font-black gap-1">
          <TrendingDown className="h-3 w-3 text-rose-600" />
          {improvementPoints} pts
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-[10px] font-extrabold text-zinc-500 gap-1">
        <Minus className="h-3 w-3" />
        0 pts
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const chartData = (data?.attempts || []).slice().reverse().map((att) => ({
    date: new Date(att.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: att.percentage,
    assessment: att.assessmentTitle,
    attempt: `Attempt #${att.attemptNumber}`,
  }));

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Award className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            ASSESSMENT HISTORY
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your performance and improvement across every assessment.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl shrink-0">
          <Link href="/assessment">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">
              Available Assessments
            </button>
          </Link>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-xs">
            Assessment History
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Input
              placeholder="Search assessment, skill, or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs h-9 bg-zinc-50 dark:bg-zinc-800"
            />
            <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_score">Highest Score</option>
              <option value="lowest_score">Lowest Score</option>
              <option value="most_improved">Most Improved</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 text-xs h-9"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-100 dark:border-zinc-800 scrollbar-none">
          <Clock className="h-4 w-4 text-zinc-400 shrink-0 mr-1" />
          {timeRangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTimeRange(opt.value);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                timeRange === opt.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
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
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-center p-8 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Unable to load assessment history.</h3>
            <p className="text-xs text-zinc-500 mt-1">Please check your connection and try again.</p>
          </div>
          <Button onClick={() => refetch()} className="bg-rose-600 text-white font-bold text-xs mx-auto">
            Retry
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.summary.totalAttempts === 0 && !isLoading && !error && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center p-12 rounded-3xl space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-100 dark:border-purple-900/50">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              NO ASSESSMENT HISTORY YET
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Complete an assessment to start tracking your performance and improvement over time.
            </p>
          </div>
          <Link href="/assessment">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2 rounded-xl px-6 mt-2">
              <Brain className="h-4 w-4" />
              Start Assessment
            </Button>
          </Link>
        </Card>
      )}

      {/* MAIN CONTENT */}
      {data && data.summary.totalAttempts > 0 && !isLoading && (
        <div className="space-y-8">
          {/* SUMMARY METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {data.summary.totalAttempts}
              </div>
              <div className="text-xs font-semibold text-zinc-500">Total Attempts</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200/80 dark:border-purple-950/60 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {data.summary.averageScore}%
              </div>
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">Average Score</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200/80 dark:border-emerald-950/60 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {data.summary.bestScore}%
              </div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Best Score</div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-indigo-200/80 dark:border-indigo-950/60 shadow-xs text-center space-y-1">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {data.summary.latestScore}%
              </div>
              <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Latest Score</div>
            </div>
          </div>

          {/* PERFORMANCE TREND CHART */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Assessment Score Progression Trend
              </CardTitle>
              <span className="text-[11px] font-mono text-zinc-400">
                {chartData.length} {chartData.length === 1 ? 'Attempt' : 'Attempts'}
              </span>
            </CardHeader>
            <CardContent className="p-6">
              {chartData.length <= 1 ? (
                <div className="p-6 text-center space-y-2 bg-purple-50/30 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Baseline Attempt Recorded ({data.summary.latestScore}%)
                  </div>
                  <p className="text-xs text-zinc-500">
                    Complete another attempt to see your improvement trend over time.
                  </p>
                </div>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
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
                        name="Score %"
                        stroke={chartTheme.primaryColor}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ASSESSMENT HISTORY TABLE */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row justify-between items-center">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                Assessment Attempts ({data.pagination.total})
              </CardTitle>

              {data.targetRoleName && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                  Role Context: {data.targetRoleName}
                </span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {data.attempts.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-500">
                  No assessment attempts match your active search or filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase font-bold text-[10px] bg-zinc-50/50 dark:bg-zinc-850">
                        <th className="py-3 px-4">Assessment & Skill</th>
                        <th className="py-3 px-4">Attempt</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Correct / Incorrect / Blank</th>
                        <th className="py-3 px-4">Improvement</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {data.attempts.map((att) => (
                        <tr
                          key={att._id}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/60 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span>{att.assessmentTitle}</span>
                              {getProficiencyBadge(att.proficiency)}
                            </div>
                            <div className="text-[10px] font-normal text-zinc-400 mt-0.5">
                              Skill: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{att.skillName}</span> ({att.category})
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                            Attempt #{att.attemptNumber}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                              {att.percentage}%
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="h-3 w-3" /> {att.correctAnswers}
                              </span>
                              <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                <XCircle className="h-3 w-3" /> {att.incorrectAnswers}
                              </span>
                              {att.unanswered > 0 && (
                                <span className="text-amber-600 font-bold flex items-center gap-0.5">
                                  <HelpCircle className="h-3 w-3" /> {att.unanswered}
                                </span>
                              )}
                              <span className="text-zinc-400">/ {att.totalQuestions}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getImprovementBadge(att.improvementPoints)}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-500">
                            {formatDuration(att.timeTaken)}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500">
                            {new Date(att.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedAttempt(att)}
                              className="h-7 text-[11px] font-bold gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION */}
              {data.pagination.totalPages > 1 && (
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-medium">
                    Showing Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="h-8 text-xs font-semibold gap-1"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SKILL & TOPIC PERFORMANCE BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Performance Breakdown */}
            {data.skillPerformanceSummary.length > 0 && (
              <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    Skill Assessment Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {data.skillPerformanceSummary.map((skill) => (
                    <div
                      key={skill.skillName}
                      className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{skill.skillName}</span>
                        <Badge variant="purple" className="text-[10px]">
                          {skill.attemptCount} {skill.attemptCount === 1 ? 'Attempt' : 'Attempts'}
                        </Badge>
                      </div>
                      <Progress value={skill.latestScore} className="h-1.5" />
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                        <span>Latest: {skill.latestScore}%</span>
                        <span>Best: {skill.bestScore}%</span>
                        <span>Avg: {skill.averageScore}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Topic Performance Breakdown */}
            {data.topicPerformanceSummary.length > 0 && (
              <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-600" />
                    Topic Accuracy Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {data.topicPerformanceSummary.map((tp) => (
                    <div key={tp.topic} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-zinc-800 dark:text-zinc-200">{tp.topic}</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                          {tp.correct} / {tp.questionsAttempted} ({tp.percentage}%)
                        </span>
                      </div>
                      <Progress value={tp.percentage} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ATTEMPT DETAILS MODAL */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                  Attempt #{selectedAttempt.attemptNumber} Details
                </span>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {selectedAttempt.assessmentTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAttempt(null)}
                className="text-zinc-400 hover:text-zinc-600 text-lg font-bold p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score & Improvement Highlights */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-center">
              <div>
                <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase">Score</div>
                <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {selectedAttempt.percentage}%
                </div>
              </div>

              <div>
                <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase">Improvement</div>
                <div className="mt-1 flex justify-center">{getImprovementBadge(selectedAttempt.improvementPoints)}</div>
              </div>

              <div>
                <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold uppercase">Proficiency</div>
                <div className="mt-1 flex justify-center">{getProficiencyBadge(selectedAttempt.proficiency)}</div>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 space-y-0.5">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block">Correct</span>
                <span className="text-lg font-black text-emerald-600 font-mono">{selectedAttempt.correctAnswers}</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 space-y-0.5">
                <span className="text-rose-700 dark:text-rose-300 font-bold block">Incorrect</span>
                <span className="text-lg font-black text-rose-600 font-mono">{selectedAttempt.incorrectAnswers}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 space-y-0.5">
                <span className="text-amber-700 dark:text-amber-300 font-bold block">Unanswered</span>
                <span className="text-lg font-black text-amber-600 font-mono">{selectedAttempt.unanswered}</span>
              </div>
            </div>

            {/* Attempt Details List */}
            <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Skill / Category:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {selectedAttempt.skillName} ({selectedAttempt.category})
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Time Taken:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {formatDuration(selectedAttempt.timeTaken)}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-zinc-500">Previous Attempt Score:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {selectedAttempt.previousScore !== null ? `${selectedAttempt.previousScore}%` : 'None (First Attempt)'}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Completed Date:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {new Date(selectedAttempt.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Topic Performance in Attempt */}
            {selectedAttempt.topicPerformance.length > 0 && (
              <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Topic Performance in Attempt</h4>
                <div className="space-y-1.5">
                  {selectedAttempt.topicPerformance.map((tp) => (
                    <div key={tp.topic} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-700 dark:text-zinc-300">{tp.topic}</span>
                        <span className="font-mono font-bold text-purple-600">
                          {tp.correct} / {tp.questionsAttempted} ({tp.percentage}%)
                        </span>
                      </div>
                      <Progress value={tp.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAttempt(null)}
                className="text-xs font-semibold"
              >
                Close
              </Button>
              <Link href={`/assessment/results/${selectedAttempt.attemptId}`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5">
                  Full Question Review
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
