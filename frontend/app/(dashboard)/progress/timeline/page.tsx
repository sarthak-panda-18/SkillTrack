'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
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
  XCircle,
  AlertTriangle,
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
      return <ClipboardCheck className="h-5 w-5 text-[#FFD400]" />;
    case 'SKILL_IMPROVED':
    case 'SKILL_MILESTONE':
      return <TrendingUp className="h-5 w-5 text-[#FFD400]" />;
    case 'TOPIC_STARTED':
    case 'TOPIC_COMPLETED':
    case 'STUDY_PLAN_COMPLETED':
      return <BookOpen className="h-5 w-5 text-[#FFD400]" />;
    case 'CAREER_GOAL_SET':
    case 'CAREER_GOAL_CHANGED':
      return <Target className="h-5 w-5 text-[#FFD400]" />;
    case 'CAREER_OUTCOME_CREATED':
    case 'CAREER_OUTCOME_SUBMITTED':
      return <Briefcase className="h-5 w-5 text-[#FFD400]" />;
    case 'CAREER_OUTCOME_VERIFIED':
      return <BadgeCheck className="h-5 w-5 text-[#FFD400]" />;
    case 'CAREER_OUTCOME_REJECTED':
      return <XCircle className="h-5 w-5 text-rose-400" />;
    case 'CAREER_OUTCOME_CHANGES_REQUESTED':
      return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    case 'ACHIEVEMENT_UNLOCKED':
      return <Trophy className="h-5 w-5 text-[#FFD400]" />;
    default:
      return <Sparkles className="h-5 w-5 text-[#FFD400]" />;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono">
        <div>
          <Link
            href="/progress"
            className="inline-flex items-center text-xs font-bold text-[#FFD400] hover:underline mb-2 gap-1 uppercase"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#FFD400]" />
            Back to Readiness Overview
          </Link>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground uppercase">
            PROGRESS TIMELINE
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Track your SkillTrack journey and see how your preparation has evolved over time.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-center gap-2 font-mono uppercase text-xs"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* HERO SUMMARY */}
      {data?.heroSummary && (
        <Card className="border-[#FFD400]/40 rounded-sm font-mono">
          <CardHeader className="p-6 pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FFD400]" />
                YOUR JOURNEY
              </CardTitle>
              <Badge variant="default" className="text-[10px] font-bold bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                {data.heroSummary.totalActivities} Total Activities
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-sm bg-surface-secondary border border-border">
              <div className="text-3xl font-black text-card-foreground">
                {data.heroSummary.totalActivities}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted-foreground mt-0.5">
                Total Activities
              </div>
            </div>

            <div className="p-3 rounded-sm bg-surface-secondary border border-border">
              <div className="text-3xl font-black text-[#FFD400]">
                {data.heroSummary.assessmentsCompleted}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted-foreground mt-0.5">
                Assessments
              </div>
            </div>

            <div className="p-3 rounded-sm bg-surface-secondary border border-border">
              <div className="text-3xl font-black text-[#FFD400]">
                {data.heroSummary.topicsCompleted}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted-foreground mt-0.5">
                Topics Completed
              </div>
            </div>

            <div className="p-3 rounded-sm bg-surface-secondary border border-border">
              <div className="text-3xl font-black text-[#FFD400]">
                {data.heroSummary.skillsImproved}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted-foreground mt-0.5">
                Skills Improved
              </div>
            </div>

            <div className="p-3 rounded-sm bg-surface-secondary border border-border col-span-2 sm:col-span-1">
              <div className="text-3xl font-black text-[#FFD400]">
                {data.heroSummary.careerMilestones}
              </div>
              <div className="text-[11px] font-bold uppercase text-muted-foreground mt-0.5">
                Milestones
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FILTER & CONTROL BAR */}
      <div className="flex flex-col gap-4 p-4 rounded-sm bg-surface-secondary border border-border font-mono">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                category === cat.value
                  ? 'bg-[#FFD400] text-black font-extrabold'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Filter & Sort Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground uppercase">Timeframe:</span>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as TimelineDateFilter);
                setPage(1);
              }}
              className="bg-background border border-input text-xs font-mono font-bold text-foreground rounded-sm px-2.5 py-1 focus:outline-none focus:border-[#FFD400]"
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
            className="text-xs font-bold uppercase text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2.5"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            Order: {sort === 'DESC' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="space-y-6 pl-4 border-l-2 border-[#FFD400]/40 ml-4 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-[31px] top-1 h-6 w-6 rounded-sm bg-[#FFD400] border-2 border-black" />
              <Skeleton className="h-24 w-full rounded-sm bg-surface-secondary" />
            </div>
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-500/40 text-center p-8 rounded-sm space-y-4 max-w-md mx-auto font-mono">
          <div className="h-12 w-12 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-card-foreground">
              Unable to load your progress timeline.
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">
              Please check your connection or try again.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2 text-xs uppercase"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.events.length === 0 && !isLoading && !error && (
        <Card className="text-center p-12 rounded-sm space-y-4 max-w-lg mx-auto font-mono">
          <div className="h-16 w-16 rounded-sm bg-surface-secondary text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <Sparkles className="h-8 w-8 text-[#FFD400]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-card-foreground uppercase tracking-tight">
              YOUR JOURNEY STARTS HERE
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              You haven't completed any tracked activities yet.
            </p>
          </div>
          <Link href="/learning">
            <Button variant="primary" className="font-bold text-xs uppercase gap-2 px-6 rounded-sm mt-2">
              <BookOpen className="h-4 w-4 text-black" />
              Start Learning
            </Button>
          </Link>
        </Card>
      )}

      {/* VERTICAL TIMELINE */}
      {data && data.events.length > 0 && !isLoading && (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#FFD400]/40 ml-4 sm:ml-6 space-y-6">
          {data.events.map((event: TimelineEvent, idx: number) => {
            const formattedDate = formatEventDate(event.timestamp);
            const formattedTime = formatEventTime(event.timestamp);
            const icon = getEventIcon(event.eventType, event.category);

            return (
              <div
                key={event.id || `${event.eventType}-${idx}`}
                className="relative group font-mono"
              >
                {/* Timeline Dot Node */}
                <div className="absolute -left-[37px] sm:-left-[45px] top-4 h-8 w-8 sm:h-9 sm:w-9 rounded-sm bg-background border-2 border-[#FFD400] flex items-center justify-center">
                  {icon}
                </div>

                {/* Event Card */}
                <div className="p-4 sm:p-5 rounded-sm bg-card border border-border hover:border-[#FFD400]/50 transition-all duration-200 space-y-3">
                  {/* Top Row: Category Badge & Date */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-surface-secondary text-[#FFD400] border border-[#FFD400]/40">
                      {event.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formattedDate}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-xl text-card-foreground uppercase flex items-center gap-2">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* METADATA CHIPS / SCORE BADGES */}
                  {event.metadata && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono">
                      {event.metadata.score !== undefined && (
                        <Badge variant="default" className="text-xs font-extrabold py-0.5 px-2 bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                          Score: {event.metadata.score}%
                        </Badge>
                      )}

                      {event.metadata.accuracy !== undefined && (
                        <Badge variant="default" className="text-xs font-extrabold py-0.5 px-2 bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                          Accuracy: {event.metadata.accuracy}%
                        </Badge>
                      )}

                      {event.metadata.previousScore !== undefined && event.metadata.newScore !== undefined && (
                        <Badge variant="default" className="text-xs font-black py-0.5 px-2.5 bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                          {event.metadata.previousScore}% → {event.metadata.newScore}%
                        </Badge>
                      )}

                      {event.metadata.proficiency && (
                        <span className="text-[11px] font-bold text-muted-foreground px-2 py-0.5 rounded-sm bg-surface-secondary border border-border uppercase">
                          Level: {event.metadata.proficiency}
                        </span>
                      )}

                      {event.metadata.roleName && (
                        <Badge variant="default" className="text-[11px] font-bold uppercase bg-surface text-card-foreground">
                          Role: {event.metadata.roleName}
                        </Badge>
                      )}

                      {event.metadata.status && (
                        <Badge variant="default" className="text-[11px] font-bold uppercase text-muted-foreground bg-surface-secondary border-border">
                          {event.metadata.status}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {data && data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-border font-mono">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="gap-1.5 text-xs font-bold uppercase"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-xs font-bold text-muted-foreground uppercase">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={!data.pagination.hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="gap-1.5 text-xs font-bold uppercase"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </PageWrapper>
  );
}

