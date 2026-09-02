'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Brain,
  ArrowRight,
  Zap,
  ExternalLink,
  Youtube,
  RefreshCw,
  Eye,
  Award,
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
        <Skeleton className="h-28 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-44 w-full rounded-sm bg-[#0A0A0A]" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
          <Skeleton className="h-32 w-full rounded-sm bg-[#0A0A0A]" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !roadmap) {
    const errMsg = (error as any)?.response?.data?.message || 'Please select a target role to generate your roadmap.';
    return (
      <PageWrapper className="max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="p-8 rounded-sm bg-[#0A0A0A] border border-white/10 text-white max-w-md mx-auto space-y-4 font-mono">
          <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <BookOpen className="h-8 w-8 text-[#FFD400]" />
          </div>
          <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">Learning Roadmap</h2>
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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2 font-mono">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#111111] text-[#FFD400] border border-[#FFD400]/40 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD400]" />
            PERSONALIZED AI LEARNING PATHWAY
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase text-white tracking-tight">{title}</h1>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">{description}</p>
        </div>

        <Button
          onClick={() => setIsRegenerateModalOpen(true)}
          variant="outline"
          className="relative z-10 border-white/20 text-white font-mono uppercase font-bold text-xs gap-2 shrink-0"
        >
          <RotateCw className="h-4 w-4" />
          Regenerate Roadmap
        </Button>
      </div>

      {/* Overview Cards & Current Focus Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Focus / Continue Learning Card */}
        <Card className="lg:col-span-2 bg-[#0A0A0A] border border-[#FFD400]/40 text-white rounded-sm">
          <CardHeader className="p-6 pb-2 border-b border-white/10 flex flex-row justify-between items-center font-mono">
            <CardTitle className="font-condensed text-xl font-extrabold uppercase tracking-wider text-[#FFD400] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FFD400] fill-[#FFD400]" />
              ACTIVE LEARNING FOCUS
            </CardTitle>
            {currentFocusTopic && (
              <Badge
                variant="default"
                className="text-[10px] font-bold uppercase bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]"
              >
                {currentFocusTopic.status.replace('_', ' ')}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {currentFocusTopic ? (
              <div className="space-y-4 font-sans">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                    Skill: {currentFocusTopic.skillName} • Est. {currentFocusTopic.estimatedHours} hrs
                  </span>
                  <h3 className="font-condensed text-2xl font-black text-white uppercase mt-0.5">
                    {currentFocusTopic.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {currentFocusTopic.description}
                  </p>
                </div>

                {/* Data-Driven Reason */}
                {currentFocusTopic.reason && (
                  <div className="p-3 rounded-sm bg-[#111111] border border-white/10 text-xs text-zinc-300 flex items-start gap-2 font-mono">
                    <Brain className="h-4 w-4 text-[#FFD400] shrink-0 mt-0.5" />
                    <span><strong className="text-[#FFD400] uppercase">Why this topic:</strong> {currentFocusTopic.reason}</span>
                  </div>
                )}

                {/* Direct Learning Video Action */}
                <div className="p-4 rounded-sm bg-[#111111] border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-sm bg-rose-600 flex items-center justify-center shrink-0">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                        Recommended Video Tutorial
                      </div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {currentFocusTopic.learningResource?.title || `${currentFocusTopic.title} Tutorial`}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => fetchResourceMutation.mutate(currentFocusTopic.topicId)}
                    isLoading={fetchResourceMutation.isPending}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase gap-1.5 shrink-0"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Watch Tutorial ↗
                  </Button>
                </div>

                {/* Progress Controls */}
                <div className="space-y-2 pt-2 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold uppercase">Current Topic Progress</span>
                    <span className="font-condensed text-lg font-black text-[#FFD400]">
                      {currentFocusTopic.progress}%
                    </span>
                  </div>
                  <Progress value={currentFocusTopic.progress} className="h-2 bg-zinc-800" />

                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    {currentFocusTopic.status === 'AVAILABLE' && (
                      <Button
                        size="sm"
                        onClick={() => fetchResourceMutation.mutate(currentFocusTopic.topicId)}
                        isLoading={fetchResourceMutation.isPending}
                        className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5"
                      >
                        <Play className="h-3.5 w-3.5 text-black fill-black" />
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
                          className="text-xs font-mono font-bold uppercase border-white/20 text-white"
                        >
                          Update Progress %
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => completeTopicMutation.mutate(currentFocusTopic.topicId)}
                          isLoading={completeTopicMutation.isPending}
                          className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5"
                        >
                          <CheckCircle2 className="h-4 w-4 text-black" />
                          Mark Topic Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2 font-mono">
                <CheckCircle2 className="h-10 w-10 text-[#FFD400] mx-auto" />
                <h4 className="font-condensed text-xl font-bold uppercase text-white">All Available Topics Complete!</h4>
                <p className="text-xs text-zinc-400 font-sans">Great job! Keep progressing through your stages below.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roadmap Stats & AI Executive Summary Card */}
        <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm flex flex-col justify-between font-mono">
          <CardHeader className="p-6 pb-2 border-b border-white/10">
            <CardTitle className="font-condensed text-xl font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="h-5 w-5 text-[#FFD400]" />
              ROADMAP ANALYTICS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1 text-center">
              <div className="font-condensed text-5xl font-black text-[#FFD400]">
                {overallProgress}%
              </div>
              <p className="text-xs font-bold text-zinc-300 uppercase">Overall Pathway Completion</p>
              <Progress value={overallProgress} className="h-2 bg-zinc-800 mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/10">
              <div className="p-2.5 rounded-sm bg-[#111111] border border-white/10 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Completed</span>
                <span className="font-bold text-sm text-white">
                  {completedTopicsCount} / {totalTopicsCount}
                </span>
              </div>
              <div className="p-2.5 rounded-sm bg-[#111111] border border-white/10 text-center">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Est. Time</span>
                <span className="font-bold text-sm text-white">
                  ~{estimatedTotalHours} hrs
                </span>
              </div>
            </div>

            {aiSummary && (
              <p className="text-[11px] text-zinc-400 leading-relaxed italic bg-[#111111] p-3 rounded-sm border border-white/10 font-sans">
                "{aiSummary}"
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Multi-Stage Accordion List */}
      <div className="space-y-4 font-mono">
        <h2 className="font-condensed text-2xl font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#FFD400]" />
          LEARNING STAGES & SEQUENCE
        </h2>

        <div className="space-y-4">
          {stages.map((stage, stageIdx) => {
            const isExpanded = expandedStages[stage.stageId] !== false; // Default expanded
            const isStageCompleted = stage.status === 'COMPLETED';
            const isStageLocked = stage.status === 'LOCKED';

            return (
              <Card
                key={stage.stageId}
                className={`bg-[#0A0A0A] border rounded-sm transition-all ${
                  isStageCompleted
                    ? 'border-[#FFD400]/40'
                    : isStageLocked
                    ? 'opacity-60 border-white/10'
                    : 'border-white/15'
                }`}
              >
                {/* Stage Header Bar */}
                <div
                  onClick={() => toggleStage(stage.stageId)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none border-b border-white/10"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-sm font-mono text-sm font-black flex items-center justify-center shrink-0 ${
                        isStageCompleted
                          ? 'bg-[#FFD400] text-black'
                          : isStageLocked
                          ? 'bg-[#111111] text-zinc-500 border border-white/10'
                          : 'bg-[#FFD400] text-black'
                      }`}
                    >
                      {stageIdx + 1}
                    </div>

                    <div className="space-y-0.5 min-w-0 font-sans">
                      <div className="flex items-center gap-2">
                        <h3 className="font-condensed font-bold text-xl text-white uppercase truncate">
                          {stage.title}
                        </h3>
                        <Badge
                          variant="default"
                          className="text-[10px] uppercase font-bold font-mono bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]"
                        >
                          {stage.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-1">{stage.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="font-bold text-white">
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
                {isExpanded && (
                  <CardContent className="p-5 space-y-3 bg-[#111111]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stage.topics.map((topic) => {
                        const isTopicCompleted = topic.status === 'COMPLETED';
                        const isTopicLocked = topic.status === 'LOCKED';
                        const isTopicInProgress = topic.status === 'IN_PROGRESS';

                        return (
                          <div
                            key={topic.topicId}
                            className={`p-4 rounded-sm border transition-all space-y-3 font-mono ${
                              isTopicCompleted
                                ? 'bg-[#0A0A0A] border-[#FFD400]/40 text-white'
                                : isTopicInProgress
                                ? 'bg-[#0A0A0A] border-[#FFD400] text-white shadow-sm'
                                : isTopicLocked
                                ? 'bg-[#0A0A0A] border-white/10 opacity-60 text-zinc-400'
                                : 'bg-[#0A0A0A] border-white/10 text-white'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1 pr-2 font-sans">
                                <div className="flex flex-wrap items-center gap-1.5 font-mono">
                                  <Badge variant="default" className="text-[9px] py-0 font-bold bg-[#111111] text-zinc-300 border-white/10">
                                    {topic.skillName}
                                  </Badge>
                                  <Badge variant="default" className="text-[9px] py-0 font-bold bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">
                                    {topic.difficulty}
                                  </Badge>
                                </div>

                                <h4 className="font-condensed font-bold text-lg text-white uppercase leading-snug">
                                  {topic.title}
                                </h4>
                              </div>

                              <Badge
                                variant="default"
                                className="text-[9px] py-0 uppercase font-bold font-mono shrink-0 bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]"
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

                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                              {topic.description}
                            </p>

                            {/* Video Resource Quick Display */}
                            {topic.learningResource && (
                              <div className="p-2.5 rounded-sm bg-[#111111] border border-rose-500/40 flex items-center justify-between text-xs gap-2 font-mono">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Youtube className="h-4 w-4 text-rose-400 shrink-0" />
                                  <span className="font-bold text-white truncate text-[11px] font-sans">
                                    {topic.learningResource.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-zinc-400 shrink-0">
                                  {topic.learningResource.duration}
                                </span>
                              </div>
                            )}

                            {/* Prerequisites Lock Warning */}
                            {isTopicLocked && topic.prerequisites && topic.prerequisites.length > 0 && (
                              <div className="p-2 rounded-sm bg-[#111111] text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 border border-white/10">
                                <Lock className="h-3 w-3 text-zinc-400 shrink-0" />
                                <span>Requires: {topic.prerequisites.join(', ')}</span>
                              </div>
                            )}

                            {/* Progress Bar & Controls */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                                <span>~{topic.estimatedHours} hrs</span>
                                <span className="font-bold text-[#FFD400]">
                                  {topic.progress}%
                                </span>
                              </div>
                              <Progress value={topic.progress} className="h-1.5 bg-zinc-800" />
                            </div>

                            {/* Card Actions */}
                            <div className="pt-2 flex justify-between items-center border-t border-white/10 font-mono">
                              <button
                                onClick={() => {
                                  setSelectedTopic(topic);
                                  setSliderProgress(topic.progress);
                                }}
                                className="text-[11px] font-bold text-[#FFD400] hover:underline uppercase"
                              >
                                View Details
                              </button>

                              <div className="flex items-center gap-1.5">
                                {topic.status === 'AVAILABLE' && (
                                  <Button
                                    size="sm"
                                    onClick={() => fetchResourceMutation.mutate(topic.topicId)}
                                    isLoading={fetchResourceMutation.isPending}
                                    className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-[11px] uppercase h-7 px-3 gap-1"
                                  >
                                    <Play className="h-3 w-3 text-black fill-black" />
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
                                      className="text-rose-400 border-rose-500/40 hover:bg-rose-950 font-mono text-[11px] uppercase h-7 px-2.5 gap-1"
                                    >
                                      <Youtube className="h-3.5 w-3.5 text-rose-400" />
                                      Watch ↗
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => completeTopicMutation.mutate(topic.topicId)}
                                      isLoading={completeTopicMutation.isPending}
                                      className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-[11px] uppercase h-7 px-2.5 gap-1"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                                      Done
                                    </Button>
                                  </>
                                )}

                                {isTopicCompleted && (
                                  <span className="text-[#FFD400] font-bold text-[11px] flex items-center gap-1 uppercase">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD400]" /> Done
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommended YouTube Tutorial Modal */}
      <Dialog open={!!videoModalTopic} onOpenChange={(open) => !open && setVideoModalTopic(null)}>
        {videoModalTopic && (
          <DialogContent className="max-w-xl bg-[#0A0A0A] border-white/10 text-white font-mono">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] bg-[#FFD400]/20 text-[#FFD400]">
                  {videoModalTopic.skillName}
                </Badge>
                <Badge variant="default" className="text-[10px] uppercase font-bold flex items-center gap-1 bg-rose-950 text-rose-300 border-rose-500/40">
                  <Youtube className="h-3 w-3" /> YouTube Recommended
                </Badge>
              </div>
              <DialogTitle className="font-condensed text-2xl font-bold uppercase text-white">
                {videoModalTopic.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 font-sans">
                Top rated educational video matching your current topic gap.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Video Preview Card */}
              {activeResource && (
                <div className="p-4 rounded-sm bg-[#111111] text-white space-y-3 border border-white/10">
                  {activeResource.thumbnail && (
                    <div className="relative aspect-video rounded-sm overflow-hidden bg-black border border-white/10">
                      <img
                        src={activeResource.thumbnail}
                        alt={activeResource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-sm bg-black/80 text-[10px] font-mono text-white font-bold">
                        {activeResource.duration}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 font-sans">
                    <h4 className="font-condensed font-bold text-base text-white leading-snug">
                      {activeResource.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{activeResource.channelName}</span>
                      {activeResource.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-zinc-400" /> {activeResource.viewCount.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-white/10 font-mono">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshResourceMutation.mutate(videoModalTopic.topicId)}
                      isLoading={refreshResourceMutation.isPending}
                      className="border-white/20 text-white uppercase text-xs font-semibold gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Find Another Video
                    </Button>

                    <a
                      href={activeResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {activeResource.videoId ? 'Watch Direct on YouTube ↗' : 'Search YouTube ↗'}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 font-mono">
              <Button variant="outline" className="border-white/20 text-white uppercase" onClick={() => setVideoModalTopic(null)}>
                Close
              </Button>
              <Button
                onClick={() => completeTopicMutation.mutate(videoModalTopic.topicId)}
                isLoading={completeTopicMutation.isPending}
                className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-black" />
                Mark Topic Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Topic Detail Modal */}
      <Dialog open={!!selectedTopic} onOpenChange={(open) => !open && setSelectedTopic(null)}>
        {selectedTopic && (
          <DialogContent className="max-w-md bg-[#0A0A0A] border-white/10 text-white font-mono">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[10px] bg-[#FFD400]/20 text-[#FFD400]">
                  {selectedTopic.skillName}
                </Badge>
                <Badge variant="default" className="text-[10px] bg-zinc-800 text-zinc-300">
                  {selectedTopic.difficulty}
                </Badge>
              </div>
              <DialogTitle className="font-condensed text-2xl font-bold uppercase text-white">
                {selectedTopic.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 font-sans">
                {selectedTopic.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs font-mono">
              {selectedTopic.reason && (
                <div className="p-3 rounded-sm bg-[#111111] border border-white/10 text-zinc-300 font-sans leading-relaxed">
                  <strong className="text-[#FFD400] uppercase font-mono">Why this topic:</strong> {selectedTopic.reason}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-zinc-400 uppercase">Set Topic Progress:</span>
                  <span className="font-condensed text-xl font-extrabold text-[#FFD400]">
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
                  className="w-full h-2 bg-zinc-800 rounded-sm appearance-none cursor-pointer accent-[#FFD400]"
                />

                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>0% (Not Started)</span>
                  <span>50% (In Progress)</span>
                  <span>100% (Completed)</span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 font-mono">
              <Button variant="outline" className="border-white/20 text-white uppercase" onClick={() => setSelectedTopic(null)}>
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
                className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase"
              >
                Save Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Regenerate Confirmation Modal */}
      <Dialog open={isRegenerateModalOpen} onOpenChange={setIsRegenerateModalOpen}>
        <DialogContent className="max-w-md bg-[#0A0A0A] border-white/10 text-white font-mono">
          <DialogHeader>
            <DialogTitle className="font-condensed text-2xl font-bold uppercase flex items-center gap-2 text-white">
              <RotateCw className="h-5 w-5 text-[#FFD400]" />
              Regenerate Learning Roadmap?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 leading-relaxed font-sans">
              This will calculate a fresh learning sequence based on your latest skill gaps. Your completed topic progress will be automatically preserved for matching topics.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 font-mono">
            <Button variant="outline" className="border-white/20 text-white uppercase" onClick={() => setIsRegenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => regenerateMutation.mutate()}
              isLoading={regenerateMutation.isPending}
              className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase"
            >
              Confirm & Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

