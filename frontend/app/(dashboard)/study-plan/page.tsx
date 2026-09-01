'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
  RotateCw,
  Target,
  ArrowRight,
  Brain,
  Zap,
  Sliders,
  CheckSquare,
  Play,
  RotateCcw,
  Coffee,
  ChevronRight,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { studyPlanService } from '@/services/studyPlan.service';
import { roadmapService } from '@/services/roadmap.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { StudyPlan, StudyPlanDay, StudyTask, StudyPlanPreferences } from '@/types/studyPlan';

const WEEKDAYS = [
  { label: 'Mon', value: 'MONDAY' },
  { label: 'Tue', value: 'TUESDAY' },
  { label: 'Wed', value: 'WEDNESDAY' },
  { label: 'Thu', value: 'THURSDAY' },
  { label: 'Fri', value: 'FRIDAY' },
  { label: 'Sat', value: 'SATURDAY' },
  { label: 'Sun', value: 'SUNDAY' },
];

export default function StudyPlanPage() {
  const queryClient = useQueryClient();
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [rescheduleTaskObj, setRescheduleTaskObj] = useState<StudyTask | null>(null);
  const [rescheduleDateStr, setRescheduleDateStr] = useState('');

  // Preference Form State
  const [prefsForm, setPrefsForm] = useState<StudyPlanPreferences>({
    dailyStudyMinutes: 120,
    studyDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
    preferredStudyTime: 'EVENING',
    studyIntensity: 'BALANCED',
    planDurationWeeks: 1,
  });

  // Fetch active study plan
  const { data: studyPlan, isLoading, error } = useQuery<StudyPlan>({
    queryKey: ['study-plan'],
    queryFn: () => studyPlanService.getStudentStudyPlan(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const generatePlanMutation = useMutation({
    mutationFn: (prefs: StudyPlanPreferences) => studyPlanService.generateStudyPlan(prefs),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['study-plan'], newPlan);
      toast.success('Personalized Study Plan generated!');
      setIsPrefsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate study plan.');
    },
  });

  const regeneratePlanMutation = useMutation({
    mutationFn: () => studyPlanService.regenerateStudyPlan(),
    onSuccess: (newPlan) => {
      queryClient.setQueryData(['study-plan'], newPlan);
      toast.success('Study Plan refreshed with latest roadmap data!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to refresh study plan.');
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' }) =>
      studyPlanService.updateTaskStatus(taskId, status),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(['study-plan'], updatedPlan);
      queryClient.invalidateQueries({ queryKey: ['learning-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis'] });
      toast.success('Task progress updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update task.');
    },
  });

  const rescheduleTaskMutation = useMutation({
    mutationFn: ({ taskId, targetDate }: { taskId: string; targetDate: string }) =>
      studyPlanService.rescheduleTask(taskId, targetDate),
    onSuccess: (updatedPlan) => {
      queryClient.setQueryData(['study-plan'], updatedPlan);
      toast.success('Task rescheduled!');
      setRescheduleTaskObj(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reschedule task.');
    },
  });

  // YouTube Video Launch Handler
  const watchTutorialMutation = useMutation({
    mutationFn: (topicId: string) => roadmapService.getTopicResource(topicId),
    onSuccess: (data) => {
      const resource = data.learningResource || data.topic?.learningResource;
      if (resource && resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.info('Tutorial search opened in new tab.');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to launch tutorial.');
    },
  });

  // Determine Today's Day Object
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayDay = useMemo(() => {
    if (!studyPlan || !studyPlan.days) return null;
    return studyPlan.days.find((d) => d.date === todayStr) || studyPlan.days[0];
  }, [studyPlan, todayStr]);

  const activeDisplayDay = useMemo(() => {
    if (!studyPlan || !studyPlan.days) return null;
    if (selectedDayId) {
      return studyPlan.days.find((d) => d.dayId === selectedDayId) || todayDay;
    }
    return todayDay;
  }, [studyPlan, selectedDayId, todayDay]);

  const toggleDayOfWeekPref = (dayVal: string) => {
    setPrefsForm((prev) => {
      const exists = prev.studyDays.includes(dayVal);
      const updatedDays = exists
        ? prev.studyDays.filter((d) => d !== dayVal)
        : [...prev.studyDays, dayVal];
      return { ...prev, studyDays: updatedDays };
    });
  };

  if (isLoading) {
    return (
      <PageWrapper className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !studyPlan) {
    const errMsg = (error as any)?.response?.data?.message || 'Please build your learning roadmap first.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 flex items-center justify-center mx-auto">
            <CalendarIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">AI Personalized Study Plan</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">{errMsg}</p>
          <Link href="/learning">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
              Generate Personalized Roadmap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const {
    careerRoleName,
    title,
    summary,
    dailyStudyMinutes = 120,
    overallProgress = 0,
    completedMinutes = 0,
    totalPlannedMinutes = 0,
    completedTasksCount = 0,
    totalTasksCount = 0,
    streakDays = 1,
    aiSummary,
    days = [],
  } = studyPlan;

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-zinc-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-purple-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              AI Study Scheduler
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold border border-amber-500/30">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {streakDays} Day Streak
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
          <p className="text-xs text-purple-200 max-w-2xl leading-relaxed">{summary}</p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <Button
            onClick={() => setIsPrefsModalOpen(true)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-bold text-xs gap-2"
          >
            <Sliders className="h-4 w-4" />
            Personalize Preferences
          </Button>
          <Button
            onClick={() => regeneratePlanMutation.mutate()}
            isLoading={regeneratePlanMutation.isPending}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 font-bold text-xs gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Grid: Weekly Calendar Matrix & Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus Task Card List (2 Cols) */}
        <Card className="lg:col-span-2 shadow-sm border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-white to-purple-50/20 dark:from-zinc-900 dark:to-purple-950/20">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                {activeDisplayDay?.date === todayStr
                  ? "Today's Study Focus"
                  : `Schedule for ${activeDisplayDay?.dayOfWeek} (${activeDisplayDay?.date})`}
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                {activeDisplayDay?.isRestDay
                  ? 'Scheduled Rest & Recovery Day'
                  : `${activeDisplayDay?.completedMinutes || 0} / ${activeDisplayDay?.totalPlannedMinutes || 0} mins completed • ${activeDisplayDay?.tasks.length || 0} tasks`}
              </p>
            </div>

            {activeDisplayDay && (
              <Badge
                variant={
                  activeDisplayDay.isRestDay
                    ? 'secondary'
                    : activeDisplayDay.status === 'COMPLETED'
                    ? 'success'
                    : activeDisplayDay.date === todayStr
                    ? 'purple'
                    : 'default'
                }
                className="text-[10px] uppercase font-bold"
              >
                {activeDisplayDay.isRestDay ? 'REST DAY' : activeDisplayDay.status}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {activeDisplayDay?.isRestDay ? (
              <div className="text-center py-10 space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
                  <Coffee className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Scheduled Rest & Review Day</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  No heavy learning tasks scheduled for today. Take time to relax or lightly review your past notes.
                </p>
              </div>
            ) : activeDisplayDay && activeDisplayDay.tasks.length > 0 ? (
              <div className="space-y-3">
                {activeDisplayDay.tasks.map((task) => {
                  const isTaskCompleted = task.status === 'COMPLETED';
                  const isTaskInProgress = task.status === 'IN_PROGRESS';
                  const isTaskSkipped = task.status === 'SKIPPED';

                  return (
                    <div
                      key={task.taskId}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        isTaskCompleted
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                          : isTaskInProgress
                          ? 'bg-white dark:bg-zinc-900 border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/10 shadow-xs'
                          : isTaskSkipped
                          ? 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              variant={
                                task.type === 'LEARN'
                                  ? 'purple'
                                  : task.type === 'PRACTICE'
                                  ? 'default'
                                  : task.type === 'ASSESS'
                                  ? 'rose'
                                  : 'secondary'
                              }
                              className="text-[9px] py-0 uppercase font-bold"
                            >
                              {task.type}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] py-0 font-bold">
                              {task.skillName}
                            </Badge>
                            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {task.durationMinutes} mins
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                            {task.title}
                          </h4>
                        </div>

                        <Badge
                          variant={
                            isTaskCompleted
                              ? 'success'
                              : isTaskInProgress
                              ? 'purple'
                              : isTaskSkipped
                              ? 'secondary'
                              : 'default'
                          }
                          className="text-[9px] py-0 uppercase font-bold shrink-0"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {task.reason && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                          <strong>Reason:</strong> {task.reason}
                        </p>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap justify-between items-center gap-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          {task.roadmapTopicId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => watchTutorialMutation.mutate(task.roadmapTopicId!)}
                              isLoading={watchTutorialMutation.isPending}
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] h-7 px-2.5 gap-1 font-bold"
                            >
                              <Play className="h-3 w-3 fill-rose-600" />
                              Watch Tutorial ↗
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {task.status !== 'COMPLETED' && (
                            <>
                              <button
                                onClick={() => {
                                  setRescheduleTaskObj(task);
                                  setRescheduleDateStr(todayStr);
                                }}
                                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 px-2 py-1"
                              >
                                Reschedule
                              </button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateTaskStatusMutation.mutate({
                                    taskId: task.taskId,
                                    status: 'COMPLETED',
                                  })
                                }
                                isLoading={updateTaskStatusMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-3 gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Complete
                              </Button>
                            </>
                          )}

                          {isTaskCompleted && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTaskStatusMutation.mutate({
                                  taskId: task.taskId,
                                  status: 'NOT_STARTED',
                                })
                              }
                              className="text-[11px] h-7 px-2.5 text-zinc-500"
                            >
                              Undo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500">No study tasks scheduled for this day.</div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Calendar & Analytics Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Study Plan Analytics */}
          <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                Weekly Study Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1 text-center">
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {overallProgress}%
                </div>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Plan Execution Rate</p>
                <Progress value={overallProgress} className="h-2 mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Tasks Done</span>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {completedTasksCount} / {totalTasksCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Time Spent</span>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {Math.round(completedMinutes / 60)}h / {Math.round(totalPlannedMinutes / 60)}h
                  </span>
                </div>
              </div>

              {aiSummary && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed italic bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  "{aiSummary}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* 7-Day Weekly Calendar Matrix */}
          <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-purple-600" />
                7-Day Study Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {days.map((day) => {
                const isSelected = activeDisplayDay?.dayId === day.dayId;
                const isToday = day.date === todayStr;

                return (
                  <div
                    key={day.dayId}
                    onClick={() => setSelectedDayId(day.dayId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 font-bold shadow-xs'
                        : isToday
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 text-center font-mono font-black text-xs py-1 rounded-lg ${
                          isToday
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {day.dayOfWeek.slice(0, 3)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs">
                            {day.date}
                          </span>
                          {isToday && <Badge variant="purple" className="text-[9px] py-0">TODAY</Badge>}
                        </div>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {day.isRestDay ? 'Rest Day' : `${day.completedMinutes}/${day.totalPlannedMinutes} mins`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          day.isRestDay
                            ? 'secondary'
                            : day.status === 'COMPLETED'
                            ? 'success'
                            : 'default'
                        }
                        className="text-[9px] py-0 font-bold uppercase"
                      >
                        {day.isRestDay ? 'REST' : `${day.tasks.length} tasks`}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferences Setup Modal */}
      <Dialog open={isPrefsModalOpen} onOpenChange={setIsPrefsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-600" />
              Personalize Study Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
              Configure your daily study limit, active study days, and preferred study intensity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Daily Study Time */}
            <div className="space-y-2">
              <label className="font-extrabold uppercase text-[10px] text-zinc-500">
                Daily Study Time Limit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '30 mins', mins: 30 },
                  { label: '1 hour (60m)', mins: 60 },
                  { label: '1.5 hours (90m)', mins: 90 },
                  { label: '2 hours (120m)', mins: 120 },
                  { label: '3 hours (180m)', mins: 180 },
                  { label: '4 hours (240m)', mins: 240 },
                ].map((opt) => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => setPrefsForm({ ...prefsForm, dailyStudyMinutes: opt.mins })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      prefsForm.dailyStudyMinutes === opt.mins
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-purple-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Study Days */}
            <div className="space-y-2">
              <label className="font-extrabold uppercase text-[10px] text-zinc-500">
                Active Study Days
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((w) => {
                  const isSelected = prefsForm.studyDays.includes(w.value);
                  return (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => toggleDayOfWeekPref(w.value)}
                      className={`h-9 w-9 rounded-xl font-mono text-xs font-black transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Study Time of Day */}
            <div className="space-y-2">
              <label className="font-extrabold uppercase text-[10px] text-zinc-500">
                Preferred Study Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Morning (8:00 AM)', val: 'MORNING' },
                  { label: 'Afternoon (1:00 PM)', val: 'AFTERNOON' },
                  { label: 'Evening (7:00 PM)', val: 'EVENING' },
                  { label: 'Night (10:00 PM)', val: 'NIGHT' },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setPrefsForm({ ...prefsForm, preferredStudyTime: t.val as any })}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                      prefsForm.preferredStudyTime === t.val
                        ? 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-bold'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPrefsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => generatePlanMutation.mutate(prefsForm)}
              isLoading={generatePlanMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Generate Custom Study Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Task Modal */}
      <Dialog open={!!rescheduleTaskObj} onOpenChange={(open) => !open && setRescheduleTaskObj(null)}>
        {rescheduleTaskObj && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-purple-600" />
                Reschedule Study Task
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Move "{rescheduleTaskObj.title}" to a future study day without overloading capacity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <label className="font-extrabold uppercase text-[10px] text-zinc-500">
                Target Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={rescheduleDateStr}
                onChange={(e) => setRescheduleDateStr(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setRescheduleTaskObj(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  rescheduleTaskMutation.mutate({
                    taskId: rescheduleTaskObj.taskId,
                    targetDate: rescheduleDateStr || todayStr,
                  })
                }
                isLoading={rescheduleTaskMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </PageWrapper>
  );
}
