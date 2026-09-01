'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  TrendingUp,
  BookOpen,
  Target,
  Briefcase,
  BadgeCheck,
  Trophy,
  ArrowLeft,
  Calendar,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  AlertCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  TimelineCategory,
  TimelineDateFilter,
  TimelineSortOrder,
  TimelineData,
  TimelineEvent,
} from '@/types/timeline';

// Helper to format timestamps into "Today", "Yesterday", or "MMM DD, YYYY"
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getEventIcon(eventType: string, category: string) {
  switch (eventType) {
    case 'ASSESSMENT_COMPLETED':
      return <ClipboardCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
    case 'SKILL_IMPROVED':
    case 'SKILL_MILESTONE':
      return <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case 'TOPIC_STARTED':
    case 'TOPIC_COMPLETED':
    case 'STUDY_PLAN_COMPLETED':
      return <BookOpen className="h-5 w-5 text-sky-600 dark:text-sky-400" />;
    case 'CAREER_GOAL_SET':
    case 'CAREER_GOAL_CHANGED':
      return <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case 'CAREER_OUTCOME_CREATED':
    case 'CAREER_OUTCOME_SUBMITTED':
      return <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case 'CAREER_OUTCOME_VERIFIED':
      return <BadgeCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case 'CAREER_OUTCOME_REJECTED':
      return <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
    case 'CAREER_OUTCOME_CHANGES_REQUESTED':
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case 'ACHIEVEMENT_UNLOCKED':
      return <Trophy className="h-5 w-5 text-amber-500 dark:text-amber-300" />;
    default:
      return <Sparkles className="h-5 w-5 text-indigo-500" />;
  }
}

function getCategoryBadgeColor(category: string) {
  switch (category) {
    case 'ASSESSMENT':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'SKILL':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'LEARNING':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    case 'CAREER':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'ACHIEVEMENT':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  }
}

export default function ProgressTimelinePage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<TimelineCategory>('ALL');
  const [dateFilter, setDateFilter] = useState<TimelineDateFilter>('ALL_TIME');
  const [sort, setSort] = useState<TimelineSortOrder>('DESC');

  const { data, isLoading, error, refetch, isFetching } = useQuery<TimelineData>({
    queryKey: ['progress-timeline', page, category, dateFilter, sort],
    queryFn: () =>
      progressService.getTimeline({
        page,
        limit: 20,
        category,
        dateFilter,
        sort,
      }),
    staleTime: 60 * 1000,
  });

  const categories: { label: string; value: TimelineCategory }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Assessments', value: 'ASSESSMENT' },
    { label: 'Skills', value: 'SKILL' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Career', value: 'CAREER' },
    { label: 'Achievements', value: 'ACHIEVEMENT' },
  ];

  const dateFilters: { label: string; value: TimelineDateFilter }[] = [
    { label: 'All Time', value: 'ALL_TIME' },
    { label: 'This Week', value: 'THIS_WEEK' },
    { label: 'This Month', value: 'THIS_MONTH' },
    { label: 'Last 3 Months', value: 'LAST_3_MONTHS' },
  ];

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/progress"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-2 gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Readiness Overview
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            PROGRESS TIMELINE
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track your SkillTrack journey and see how your preparation has evolved over time.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-center gap-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* HERO SUMMARY */}
      {data?.heroSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-purple-950/20 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-indigo-100/60 dark:border-indigo-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  YOUR JOURNEY
                </CardTitle>
                <Badge variant="default" className="text-[10px] font-bold">
                  {data.heroSummary.totalActivities} Total Activities
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {data.heroSummary.totalActivities}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Total Activities
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {data.heroSummary.assessmentsCompleted}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Assessments Completed
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400">
                  {data.heroSummary.topicsCompleted}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Topics Completed
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {data.heroSummary.skillsImproved}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Skills Improved
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 shadow-xs col-span-2 sm:col-span-1">
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                  {data.heroSummary.careerMilestones}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Career Milestones
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* FILTER & CONTROL BAR */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                category === cat.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Filter & Sort Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Timeframe:</span>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as TimelineDateFilter);
                setPage(1);
              }}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {dateFilters.map((df) => (
                <option key={df.value} value={df.value}>
                  {df.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSort(sort === 'DESC' ? 'ASC' : 'DESC')}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 gap-1.5 h-8 px-2.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
            Order: {sort === 'DESC' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="space-y-6 pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-[31px] top-1 h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-200 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 text-center p-8 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Unable to load your progress timeline.
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Please check your connection or try again.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 text-xs"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.events.length === 0 && !isLoading && !error && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center p-12 rounded-3xl space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              YOUR JOURNEY STARTS HERE
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              You haven't completed any tracked activities yet.
            </p>
          </div>
          <Link href="/learning">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 px-6 rounded-xl mt-2">
              <BookOpen className="h-4 w-4" />
              Start Learning
            </Button>
          </Link>
        </Card>
      )}

      {/* VERTICAL TIMELINE */}
      {data && data.events.length > 0 && !isLoading && (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-zinc-200 dark:border-zinc-800 ml-4 sm:ml-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {data.events.map((event: TimelineEvent, idx: number) => {
              const formattedDate = formatEventDate(event.timestamp);
              const formattedTime = formatEventTime(event.timestamp);
              const badgeClass = getCategoryBadgeColor(event.category);
              const icon = getEventIcon(event.eventType, event.category);

              return (
                <motion.div
                  key={event.id || `${event.eventType}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="relative group"
                >
                  {/* Timeline Dot Node */}
                  <div className="absolute -left-[37px] sm:-left-[45px] top-4 h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-indigo-500 dark:group-hover:border-indigo-400 shadow-xs flex items-center justify-center transition-all duration-200">
                    {icon}
                  </div>

                  {/* Event Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 space-y-3">
                    {/* Top Row: Category Badge & Date */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                        {event.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        <span>{formattedDate}</span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* METADATA CHIPS / SCORE BADGES */}
                    {event.metadata && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {event.metadata.score !== undefined && (
                          <Badge variant="default" className="text-xs font-extrabold py-0.5 px-2">
                            Score: {event.metadata.score}%
                          </Badge>
                        )}

                        {event.metadata.accuracy !== undefined && (
                          <Badge variant="success" className="text-xs font-extrabold py-0.5 px-2">
                            Accuracy: {event.metadata.accuracy}%
                          </Badge>
                        )}

                        {event.metadata.previousScore !== undefined && event.metadata.newScore !== undefined && (
                          <Badge variant="success" className="text-xs font-black py-0.5 px-2.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                            {event.metadata.previousScore}% → {event.metadata.newScore}%
                          </Badge>
                        )}

                        {event.metadata.proficiency && (
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800">
                            Level: {event.metadata.proficiency}
                          </span>
                        )}

                        {event.metadata.roleName && (
                          <Badge variant="purple" className="text-[11px] font-semibold">
                            Role: {event.metadata.roleName}
                          </Badge>
                        )}

                        {event.metadata.status && (
                          <Badge variant="outline" className="text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                            {event.metadata.status}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-xs font-bold text-zinc-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1.5 text-xs font-semibold"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </PageWrapper>
  );
}
