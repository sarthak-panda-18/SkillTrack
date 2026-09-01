'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  Brain,
  Target,
  ArrowRight,
  HelpCircle,
  Zap,
  ExternalLink,
  Youtube,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
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
import { LearningRoadmap, RoadmapStage, RoadmapTopic } from '@/types/roadmap';

export default function LearningPage() {
  const queryClient = useQueryClient();
  const [expandedStages, setExpandedStages] = useState<{ [stageId: string]: boolean }>({});
  const [selectedTopic, setSelectedTopic] = useState<RoadmapTopic | null>(null);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);

  // Resource Video Modal State
  const [videoModalTopic, setVideoModalTopic] = useState<RoadmapTopic | null>(null);
  const [activeResource, setActiveResource] = useState<any | null>(null);

  // Fetch active roadmap
  const { data: roadmap, isLoading, error } = useQuery<LearningRoadmap>({
    queryKey: ['learning-roadmap'],
    queryFn: () => roadmapService.getStudentRoadmap(),
    staleTime: 5 * 60 * 1000,
  });

  // Toggle stage expand/collapse
  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  // Mutations
  const updateProgressMutation = useMutation({
    mutationFn: ({ topicId, progress }: { topicId: string; progress: number }) =>
      roadmapService.updateTopicProgress(topicId, progress),
    onSuccess: (updatedRoadmap) => {
      queryClient.setQueryData(['learning-roadmap'], updatedRoadmap);
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis'] });
      toast.success('Progress updated!');
      if (selectedTopic) {
        setSelectedTopic(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update progress.');
    },
  });

  const completeTopicMutation = useMutation({
    mutationFn: (topicId: string) => roadmapService.completeTopic(topicId),
    onSuccess: (updatedRoadmap) => {
      queryClient.setQueryData(['learning-roadmap'], updatedRoadmap);
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis'] });
      toast.success('Topic completed! Downstream topics unlocked 🎉');
      if (selectedTopic) {
        setSelectedTopic(null);
      }
      if (videoModalTopic) {
        setVideoModalTopic(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete topic.');
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => roadmapService.regenerateRoadmap(),
    onSuccess: (newRoadmap) => {
      queryClient.setQueryData(['learning-roadmap'], newRoadmap);
      toast.success('Learning Roadmap regenerated! Completed progress preserved.');
      setIsRegenerateModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to regenerate roadmap.');
    },
  });

  // YouTube Learning Resource Mutations
  const fetchResourceMutation = useMutation({
    mutationFn: (topicId: string) => roadmapService.getTopicResource(topicId),
    onSuccess: (data, topicId) => {
      queryClient.invalidateQueries({ queryKey: ['learning-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis'] });

      const topicObj = data.topic || data;
      const resource = data.learningResource || topicObj.learningResource;

      setActiveResource(resource);
      setVideoModalTopic(topicObj);

      // Open direct video URL in new window/tab
      if (resource && resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to load learning tutorial.');
    },
  });

  const refreshResourceMutation = useMutation({
    mutationFn: (topicId: string) => roadmapService.refreshTopicResource(topicId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learning-roadmap'] });
      const topicObj = data.topic || data;
      const resource = data.learningResource || topicObj.learningResource;

      setActiveResource(resource);
      setVideoModalTopic(topicObj);
      toast.success('Alternative tutorial recommended!');

      if (resource && resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to find alternative tutorial.');
    },
  });

  // Find active focus topic (first IN_PROGRESS or first AVAILABLE)
  const currentFocusTopic = useMemo(() => {
    if (!roadmap || !roadmap.stages) return null;
    let active: RoadmapTopic | null = null;
    let avail: RoadmapTopic | null = null;

    for (const stage of roadmap.stages) {
      for (const topic of stage.topics) {
        if (topic.status === 'IN_PROGRESS' && !active) {
          active = topic;
        } else if (topic.status === 'AVAILABLE' && !avail) {
          avail = topic;
        }
      }
    }
    return active || avail;
  }, [roadmap]);

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

  if (error || !roadmap) {
    const errMsg = (error as any)?.response?.data?.message || 'Please select a target role to generate your roadmap.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">Learning Roadmap</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">{errMsg}</p>
          <Link href="/profile">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2">
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
    title,
    description,
    overallProgress = 0,
    completedTopicsCount = 0,
    totalTopicsCount = 0,
    estimatedTotalHours = 0,
    aiSummary,
    stages = [],
  } = roadmap;

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-zinc-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            Personalized AI Learning Pathway
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
          <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">{description}</p>
        </div>

        <Button
          onClick={() => setIsRegenerateModalOpen(true)}
          variant="outline"
          className="relative z-10 border-white/20 text-white hover:bg-white/10 font-bold text-xs gap-2 shrink-0"
        >
          <RotateCw className="h-4 w-4" />
          Regenerate Roadmap
        </Button>
      </div>

      {/* Overview Cards & Current Focus Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Focus / Continue Learning Card */}
        <Card className="lg:col-span-2 shadow-sm border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-white to-purple-50/20 dark:from-zinc-900 dark:to-purple-950/20">
          <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-row justify-between items-center">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              Active Learning Focus
            </CardTitle>
            {currentFocusTopic && (
              <Badge
                variant={currentFocusTopic.status === 'IN_PROGRESS' ? 'purple' : 'default'}
                className="text-[10px] font-bold uppercase"
              >
                {currentFocusTopic.status.replace('_', ' ')}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {currentFocusTopic ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                    Skill: {currentFocusTopic.skillName} • Est. {currentFocusTopic.estimatedHours} hrs
                  </span>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                    {currentFocusTopic.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                    {currentFocusTopic.description}
                  </p>
                </div>

                {/* Data-Driven Reason */}
                {currentFocusTopic.reason && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
                    <Brain className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Why this topic:</strong> {currentFocusTopic.reason}</span>
                  </div>
                )}

                {/* Direct Learning Video Action */}
                <div className="p-3.5 rounded-2xl bg-zinc-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                        Recommended Video Tutorial
                      </div>
                      <div className="text-xs font-bold text-zinc-100 line-clamp-1">
                        {currentFocusTopic.learningResource?.title || `${currentFocusTopic.title} Tutorial`}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => fetchResourceMutation.mutate(currentFocusTopic.topicId)}
                    isLoading={fetchResourceMutation.isPending}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs gap-1.5 shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Watch Tutorial ↗
                  </Button>
                </div>

                {/* Progress Controls */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 font-semibold">Current Topic Progress</span>
                    <span className="font-extrabold text-purple-600 dark:text-purple-400">
                      {currentFocusTopic.progress}%
                    </span>
                  </div>
                  <Progress value={currentFocusTopic.progress} className="h-2.5" />

                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    {currentFocusTopic.status === 'AVAILABLE' && (
                      <Button
                        size="sm"
                        onClick={() => fetchResourceMutation.mutate(currentFocusTopic.topicId)}
                        isLoading={fetchResourceMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5 fill-white" />
                        Start Learning Topic ↗
                      </Button>
                    )}

                    {currentFocusTopic.status === 'IN_PROGRESS' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTopic(currentFocusTopic);
                            setSliderProgress(currentFocusTopic.progress);
                          }}
                          className="text-xs font-semibold"
                        >
                          Update Progress %
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => completeTopicMutation.mutate(currentFocusTopic.topicId)}
                          isLoading={completeTopicMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Topic Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">All Available Topics Complete!</h4>
                <p className="text-xs text-zinc-500">Great job! Keep progressing through your stages below.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roadmap Stats & AI Executive Summary Card */}
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Roadmap Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1 text-center">
              <div className="text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {overallProgress}%
              </div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Overall Pathway Completion</p>
              <Progress value={overallProgress} className="h-2 mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Completed</span>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  {completedTopicsCount} / {totalTopicsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Est. Time</span>
                <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  ~{estimatedTotalHours} hrs
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
      </div>

      {/* Multi-Stage Accordion List */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Learning Stages & Sequence
        </h2>

        <div className="space-y-4">
          {stages.map((stage, stageIdx) => {
            const isExpanded = expandedStages[stage.stageId] !== false; // Default expanded
            const isStageCompleted = stage.status === 'COMPLETED';
            const isStageLocked = stage.status === 'LOCKED';

            return (
              <Card
                key={stage.stageId}
                className={`shadow-xs border transition-all ${
                  isStageCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/10 dark:bg-emerald-950/10'
                    : isStageLocked
                    ? 'opacity-80 border-zinc-200 dark:border-zinc-800'
                    : 'border-purple-200 dark:border-purple-900/60'
                }`}
              >
                {/* Stage Header Bar */}
                <div
                  onClick={() => toggleStage(stage.stageId)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none border-b border-zinc-100 dark:border-zinc-800/80"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl font-mono text-sm font-black flex items-center justify-center shrink-0 ${
                        isStageCompleted
                          ? 'bg-emerald-600 text-white'
                          : isStageLocked
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                          : 'bg-purple-600 text-white shadow-xs'
                      }`}
                    >
                      {stageIdx + 1}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 truncate">
                          {stage.title}
                        </h3>
                        <Badge
                          variant={
                            isStageCompleted
                              ? 'success'
                              : stage.status === 'IN_PROGRESS'
                              ? 'purple'
                              : stage.status === 'AVAILABLE'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {stage.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex flex-col items-end text-xs font-mono">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {stage.progress}% Complete
                      </span>
                      <span className="text-[10px] text-zinc-400">~{stage.estimatedHours} hrs</span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Stage Topics List */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="p-5 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stage.topics.map((topic) => {
                            const isTopicCompleted = topic.status === 'COMPLETED';
                            const isTopicLocked = topic.status === 'LOCKED';
                            const isTopicInProgress = topic.status === 'IN_PROGRESS';

                            return (
                              <div
                                key={topic.topicId}
                                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                                  isTopicCompleted
                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                                    : isTopicInProgress
                                    ? 'bg-white dark:bg-zinc-900 border-purple-300 dark:border-purple-800 ring-2 ring-purple-500/10 shadow-xs'
                                    : isTopicLocked
                                    ? 'bg-zinc-100/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-70'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1 pr-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <Badge variant="outline" className="text-[9px] py-0 font-bold">
                                        {topic.skillName}
                                      </Badge>
                                      <Badge
                                        variant={
                                          topic.difficulty === 'ADVANCED'
                                            ? 'purple'
                                            : topic.difficulty === 'INTERMEDIATE'
                                            ? 'default'
                                            : 'secondary'
                                        }
                                        className="text-[9px] py-0"
                                      >
                                        {topic.difficulty}
                                      </Badge>
                                    </div>

                                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                                      {topic.title}
                                    </h4>
                                  </div>

                                  <Badge
                                    variant={
                                      isTopicCompleted
                                        ? 'success'
                                        : isTopicInProgress
                                        ? 'purple'
                                        : topic.status === 'AVAILABLE'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    className="text-[9px] py-0 uppercase font-bold shrink-0"
                                  >
                                    {isTopicLocked ? (
                                      <span className="flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> LOCKED
                                      </span>
                                    ) : (
                                      topic.status.replace('_', ' ')
                                    )}
                                  </Badge>
                                </div>

                                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {topic.description}
                                </p>

                                {/* Video Resource Quick Display */}
                                {topic.learningResource && (
                                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-between text-xs gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Youtube className="h-4 w-4 text-rose-600 shrink-0" />
                                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate text-[11px]">
                                        {topic.learningResource.title}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                                      {topic.learningResource.duration}
                                    </span>
                                  </div>
                                )}

                                {/* Prerequisites Lock Warning */}
                                {isTopicLocked && topic.prerequisites && topic.prerequisites.length > 0 && (
                                  <div className="p-2 rounded-lg bg-zinc-200/60 dark:bg-zinc-800/80 text-[10px] text-zinc-600 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                                    <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                                    <span>Requires: {topic.prerequisites.join(', ')}</span>
                                  </div>
                                )}

                                {/* Progress Bar & Controls */}
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                                    <span>~{topic.estimatedHours} hrs</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                      {topic.progress}%
                                    </span>
                                  </div>
                                  <Progress value={topic.progress} className="h-1.5" />
                                </div>

                                {/* Card Actions */}
                                <div className="pt-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
                                  <button
                                    onClick={() => {
                                      setSelectedTopic(topic);
                                      setSliderProgress(topic.progress);
                                    }}
                                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                                  >
                                    View Details
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    {topic.status === 'AVAILABLE' && (
                                      <Button
                                        size="sm"
                                        onClick={() => fetchResourceMutation.mutate(topic.topicId)}
                                        isLoading={fetchResourceMutation.isPending}
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] h-7 px-3 gap-1"
                                      >
                                        <Play className="h-3 w-3 fill-white" />
                                        Start Topic ↗
                                      </Button>
                                    )}

                                    {isTopicInProgress && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => fetchResourceMutation.mutate(topic.topicId)}
                                          isLoading={fetchResourceMutation.isPending}
                                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[11px] h-7 px-2.5 gap-1"
                                        >
                                          <Youtube className="h-3.5 w-3.5 text-rose-600" />
                                          Watch ↗
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => completeTopicMutation.mutate(topic.topicId)}
                                          isLoading={completeTopicMutation.isPending}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] h-7 px-2.5 gap-1"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Done
                                        </Button>
                                      </>
                                    )}

                                    {isTopicCompleted && (
                                      <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommended YouTube Tutorial Modal */}
      <Dialog open={!!videoModalTopic} onOpenChange={(open) => !open && setVideoModalTopic(null)}>
        {videoModalTopic && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="text-[10px]">
                  {videoModalTopic.skillName}
                </Badge>
                <Badge variant="rose" className="text-[10px] uppercase font-bold flex items-center gap-1">
                  <Youtube className="h-3 w-3" /> YouTube Recommended
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {videoModalTopic.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Top rated educational video matching your current topic gap.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Video Preview Card */}
              {activeResource && (
                <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-3 border border-zinc-800 shadow-xl">
                  {activeResource.thumbnail && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                      <img
                        src={activeResource.thumbnail}
                        alt={activeResource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white font-bold">
                        {activeResource.duration}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-zinc-100 leading-snug">
                      {activeResource.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{activeResource.channelName}</span>
                      {activeResource.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {activeResource.viewCount.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-zinc-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshResourceMutation.mutate(videoModalTopic.topicId)}
                      isLoading={refreshResourceMutation.isPending}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Find Another Video
                    </Button>

                    <a
                      href={activeResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-colors shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {activeResource.videoId ? 'Watch Direct on YouTube ↗' : 'Search YouTube ↗'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setVideoModalTopic(null)}>
                Close
              </Button>
              <Button
                onClick={() => completeTopicMutation.mutate(videoModalTopic.topicId)}
                isLoading={completeTopicMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark Topic Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Topic Detail Modal */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        {selectedTopic && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="text-[10px]">
                  {selectedTopic.skillName}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedTopic.difficulty}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {selectedTopic.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                {selectedTopic.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {selectedTopic.reason && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-purple-900 dark:text-purple-200 leading-relaxed">
                  <strong>Why this topic:</strong> {selectedTopic.reason}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Set Topic Progress:</span>
                  <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">
                    {sliderProgress}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sliderProgress}
                  onChange={(e) => setSliderProgress(parseInt(e.target.value))}
                  className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />

                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>0% (Not Started)</span>
                  <span>50% (In Progress)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                Close
              </Button>
              <Button
                onClick={() =>
                  updateProgressMutation.mutate({
                    topicId: selectedTopic.topicId,
                    progress: sliderProgress,
                  })
                }
                isLoading={updateProgressMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                Save Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Regenerate Confirmation Modal */}
      <Dialog open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5 text-purple-600" />
              Regenerate Learning Roadmap?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
              This will calculate a fresh learning sequence based on your latest skill gaps. Your completed topic progress will be automatically preserved for matching topics.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRegenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => regenerateMutation.mutate()}
              isLoading={regenerateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              Confirm & Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
