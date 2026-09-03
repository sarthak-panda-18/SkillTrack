'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  RotateCw,
  Target,
  ArrowRight,
  Brain,
  Zap,
  Sliders,
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
import { StudyPlan, StudyTask, StudyPlanPreferences } from '@/types/studyPlan';

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
  const router = useRouter();
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
        <Skeleton className="h-28 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-44 w-full rounded-sm bg-[#0A0A0A]" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !studyPlan) {
    const errMsg = (error as any)?.response?.data?.message || 'Please build your learning roadmap first.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
          <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <CalendarIcon className="h-8 w-8 text-[#FFD400]" />
          </div>
          <h2 className="text-2xl font-extrabold uppercase text-white">AI Personalized Study Plan</h2>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">{errMsg}</p>
          <Link href="/learning">
            <Button className="w-full bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2">
              Generate Personalized Roadmap
              <ArrowRight className="h-4 w-4 text-black" />
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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-xs font-bold text-[#FFD400] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD400]" />
              AI STUDY SCHEDULER
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-sm bg-[#FFD400]/10 text-[#FFD400] text-xs font-bold border border-[#FFD400]/40 uppercase">
              <Flame className="h-3.5 w-3.5 text-[#FFD400] fill-[#FFD400]" />
              {streakDays} Day Streak
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">{title}</h1>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">{summary}</p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0 font-mono">
          <Button
            onClick={() => setIsPrefsModalOpen(true)}
            variant="secondary"
            className="font-mono font-bold text-xs uppercase gap-2"
          >
            <Sliders className="h-4 w-4" />
            Preferences
          </Button>
          <Button
            onClick={() => regeneratePlanMutation.mutate()}
            isLoading={regeneratePlanMutation.isPending}
            variant="secondary"
            className="font-mono font-bold text-xs uppercase gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Grid: Weekly Calendar Matrix & Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus Task Card List (2 Cols) */}
        <Card className="lg:col-span-2 rounded-sm">
          <CardHeader className="p-6 pb-3 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#FFD400] fill-[#FFD400]" />
                {activeDisplayDay?.date === todayStr
                  ? "TODAY'S STUDY FOCUS"
                  : `SCHEDULE FOR ${activeDisplayDay?.dayOfWeek} (${activeDisplayDay?.date})`}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {activeDisplayDay?.isRestDay
                  ? 'Scheduled Rest & Recovery Day'
                  : `${activeDisplayDay?.completedMinutes || 0} / ${activeDisplayDay?.totalPlannedMinutes || 0} mins completed • ${activeDisplayDay?.tasks.length || 0} tasks`}
              </p>
            </div>

            {activeDisplayDay && (
              <Badge
                variant="default"
                className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40"
              >
                {activeDisplayDay.isRestDay ? 'REST DAY' : activeDisplayDay.status}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {activeDisplayDay?.isRestDay ? (
              <div className="text-center py-10 space-y-3 font-mono">
                <div className="h-16 w-16 rounded-sm bg-surface-secondary text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
                  <Coffee className="h-8 w-8 text-[#FFD400]" />
                </div>
                <h3 className="text-2xl font-bold uppercase text-card-foreground">Scheduled Rest & Review Day</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-sans">
                  No heavy learning tasks scheduled for today. Take time to relax or lightly review your past notes.
                </p>
              </div>
            ) : activeDisplayDay && activeDisplayDay.tasks.length > 0 ? (
              <div className="space-y-3 font-sans">
                {activeDisplayDay.tasks.map((task) => {
                  const isTaskCompleted = task.status === 'COMPLETED';
                  const isTaskInProgress = task.status === 'IN_PROGRESS';
                  const isTaskSkipped = task.status === 'SKIPPED';

                  return (
                    <div
                      key={task.taskId}
                      className={`p-4 rounded-sm border transition-all space-y-3 ${
                        isTaskCompleted
                          ? 'bg-surface-secondary border-[#FFD400]/40'
                          : isTaskInProgress
                          ? 'bg-background border-[#FFD400]'
                          : isTaskSkipped
                          ? 'bg-surface-secondary border-border opacity-50'
                          : 'bg-surface-secondary border-border'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5 font-mono">
                            <Badge
                              variant="default"
                              className="text-[9px] py-0 uppercase font-bold bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/30"
                            >
                              {task.type}
                            </Badge>
                            <Badge variant="default" className="text-[9px] py-0 font-bold bg-surface text-muted-foreground border-border">
                              {task.skillName}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#FFD400]" /> {task.durationMinutes} mins
                            </span>
                          </div>

                          <h4 className="font-bold text-lg text-card-foreground leading-snug uppercase">
                            {task.title}
                          </h4>
                        </div>

                        <Badge
                          variant="default"
                          className="text-[9px] font-mono py-0 uppercase font-bold bg-surface text-card-foreground"
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {task.reason && (
                        <p className="text-xs text-muted-foreground leading-relaxed bg-background p-2.5 rounded-sm border border-border font-sans">
                          <strong className="text-[#FFD400] font-mono uppercase">Reason:</strong> {task.reason}
                        </p>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 flex flex-wrap justify-between items-center gap-2 border-t border-border font-mono">
                        <div className="flex items-center gap-2">
                          {task.roadmapTopicId && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => watchTutorialMutation.mutate(task.roadmapTopicId!)}
                              isLoading={watchTutorialMutation.isPending}
                              className="text-[11px] h-7 px-2.5 gap-1 font-bold uppercase"
                            >
                              <Play className="h-3 w-3 text-card-foreground" />
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
                                className="text-[11px] font-mono font-bold uppercase text-muted-foreground hover:text-foreground px-2 py-1"
                              >
                                Reschedule
                              </button>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() =>
                                  updateTaskStatusMutation.mutate({
                                    taskId: task.taskId,
                                    status: 'COMPLETED',
                                  })
                                }
                                isLoading={updateTaskStatusMutation.isPending}
                                className="font-bold text-[11px] uppercase h-7 px-3 gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                                Mark Complete
                              </Button>
                            </>
                          )}

                          {isTaskCompleted && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                updateTaskStatusMutation.mutate({
                                  taskId: task.taskId,
                                  status: 'NOT_STARTED',
                                })
                              }
                              className="text-[11px] h-7 px-2.5 uppercase"
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
              <div className="text-center py-8 text-xs text-muted-foreground font-mono">No study tasks scheduled for this day.</div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Calendar & Analytics Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Study Plan Analytics */}
          <Card className="rounded-sm font-mono">
            <CardHeader className="p-6 pb-2 border-b border-border">
              <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FFD400]" />
                WEEKLY STUDY METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1 text-center">
                <div className="text-4xl font-black text-[#FFD400]">
                  {overallProgress}%
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Plan Execution Rate</p>
                <Progress value={overallProgress} className="h-1.5 bg-surface-secondary mt-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border">
                <div className="p-2.5 rounded-sm bg-surface-secondary border border-border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tasks Done</span>
                  <span className="font-extrabold text-sm text-card-foreground">
                    {completedTasksCount} / {totalTasksCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-sm bg-surface-secondary border border-border text-center">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Time Spent</span>
                  <span className="font-extrabold text-sm text-card-foreground">
                    {Math.round(completedMinutes / 60)}h / {Math.round(totalPlannedMinutes / 60)}h
                  </span>
                </div>
              </div>

              {aiSummary && (
                <p className="text-[11px] text-muted-foreground font-sans leading-relaxed italic bg-surface-secondary p-3 rounded-sm border border-border">
                  "{aiSummary}"
                </p>
              )}
            </CardContent>
          </Card>

          {/* 7-Day Weekly Calendar Matrix */}
          <Card className="rounded-sm font-mono">
            <CardHeader className="p-6 pb-2 border-b border-border">
              <CardTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#FFD400]" />
                7-DAY STUDY MATRIX
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
                    className={`p-3 rounded-sm border transition-all cursor-pointer flex items-center justify-between text-xs uppercase ${
                      isSelected
                        ? 'bg-surface-secondary border-[#FFD400] text-card-foreground font-bold'
                        : isToday
                        ? 'bg-background border-[#FFD400]/40'
                        : 'bg-surface-secondary border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 text-center font-mono font-black text-xs py-1 rounded-sm ${
                          isToday
                            ? 'bg-[#FFD400] text-black'
                            : 'bg-surface text-foreground'
                        }`}
                      >
                        {day.dayOfWeek.slice(0, 3)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-card-foreground truncate text-xs">
                            {day.date}
                          </span>
                          {isToday && <Badge variant="default" className="text-[9px] py-0 bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">TODAY</Badge>}
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {day.isRestDay ? 'Rest Day' : `${day.completedMinutes}/${day.totalPlannedMinutes} mins`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="default"
                        className="text-[9px] py-0 font-bold uppercase bg-surface text-card-foreground"
                      >
                        {day.isRestDay ? 'REST' : `${day.tasks.length} tasks`}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
        <DialogContent className="max-w-md bg-card border-border text-card-foreground rounded-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#FFD400]" />
              PERSONALIZE STUDY PREFERENCES
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Configure your daily study limit, active study days, and preferred study intensity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs font-mono">
            {/* Daily Study Time */}
            <div className="space-y-2">
              <label className="font-bold uppercase text-[10px] text-muted-foreground">
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
                    className={`p-2.5 rounded-sm border text-xs font-bold uppercase transition-all cursor-pointer ${
                      prefsForm.dailyStudyMinutes === opt.mins
                        ? 'bg-[#FFD400] text-black border-[#FFD400] font-bold'
                        : 'bg-background border-border text-foreground hover:border-border/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Study Days */}
            <div className="space-y-2">
              <label className="font-bold uppercase text-[10px] text-muted-foreground">
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
                      className={`h-9 w-9 rounded-sm font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFD400] text-black font-bold'
                          : 'bg-surface-secondary border border-border text-muted-foreground hover:text-foreground'
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
              <label className="font-bold uppercase text-[10px] text-muted-foreground">
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
                    className={`p-2 rounded-sm border text-xs font-semibold uppercase transition-all cursor-pointer ${
                      prefsForm.preferredStudyTime === t.val
                        ? 'bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400] font-bold'
                        : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 font-mono">
            <Button variant="secondary" onClick={() => setIsPrefsModalOpen(false)} className="text-xs uppercase">
              Cancel
            </Button>
            <Button
              onClick={() => generatePlanMutation.mutate(prefsForm)}
              isLoading={generatePlanMutation.isPending}
              variant="primary"
              className="font-bold text-xs uppercase"
            >
              Generate Custom Study Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Task Modal */}
      <Dialog open={!!rescheduleTaskObj} onOpenChange={(open) => !open && setRescheduleTaskObj(null)}>
        {rescheduleTaskObj && (
          <DialogContent className="max-w-md bg-card border-border text-card-foreground rounded-sm font-mono">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase text-card-foreground flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[#FFD400]" />
                RESCHEDULE STUDY TASK
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                Move "{rescheduleTaskObj.title}" to a future study day without overloading capacity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <label className="font-bold uppercase text-[10px] text-muted-foreground">
                Target Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={rescheduleDateStr}
                onChange={(e) => setRescheduleDateStr(e.target.value)}
                className="w-full h-10 px-3 rounded-sm border border-input bg-background font-mono text-xs text-foreground focus:outline-none focus:border-[#FFD400]"
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button variant="secondary" onClick={() => setRescheduleTaskObj(null)} className="text-xs uppercase">
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
                variant="primary"
                className="font-bold text-xs uppercase"
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
