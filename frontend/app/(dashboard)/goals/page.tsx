'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Sparkles,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Lock,
  RotateCw,
  AlertCircle,
  ArrowRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { goalService } from '@/services/goal.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Goal,
  Milestone,
  GoalCategory,
  GoalStatus,
  GoalsData,
  GoalRecommendation,
  CreateGoalInput,
} from '@/types/goal';

function formatDeadline(dateString?: string): { text: string; isOverdue: boolean } {
  if (!dateString) return { text: 'No Deadline', isOverdue: false };
  const deadline = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue (${Math.abs(diffDays)}d ago)`, isOverdue: true };
  }
  if (diffDays === 0) return { text: 'Due Today', isOverdue: false };
  if (diffDays === 1) return { text: 'Due Tomorrow', isOverdue: false };
  if (diffDays <= 7) return { text: `Due in ${diffDays} days`, isOverdue: false };

  return {
    text: `Due ${deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    isOverdue: false,
  };
}

function getCategoryBadgeColor(category: string) {
  return 'bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40';
}

function getStatusBadge(status: GoalStatus) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400]">✓ Completed</Badge>;
    case 'OVERDUE':
      return <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-rose-950/60 text-rose-300 border-rose-500">Overdue</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-zinc-800 text-white border-white/20">In Progress</Badge>;
    default:
      return <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-black text-zinc-400 border-white/10">Not Started</Badge>;
  }
}

export default function GoalsPage() {
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sort, setSort] = useState<string>('active_first');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<GoalCategory>('SKILL');
  const [formTargetValue, setFormTargetValue] = useState<number>(1);
  const [formUnit, setFormUnit] = useState('milestones');
  const [formDeadline, setFormDeadline] = useState('');

  const [addingTemplateId, setAddingTemplateId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery<GoalsData>({
    queryKey: ['student-goals', category, statusFilter, sort],
    queryFn: () =>
      goalService.getStudentGoals({
        category,
        status: statusFilter,
        sort,
      }),
    staleTime: 30 * 1000,
  });

  const { data: recommendations = [] } = useQuery<GoalRecommendation[]>({
    queryKey: ['goal-recommendations'],
    queryFn: () => goalService.getGoalRecommendations(),
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newGoal: CreateGoalInput) => goalService.createGoal(newGoal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['progress-timeline'] });
      toast.success('Goal added successfully.');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Unable to add goal. Please try again.');
    },
  });

  const handleAddTemplateGoal = (rec: GoalRecommendation) => {
    if (rec.isAdded || addingTemplateId) return;
    setAddingTemplateId(rec.templateId);
    createMutation.mutate(
      {
        templateId: rec.templateId,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        isSystemRecommended: true,
        milestones: rec.milestones,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['goal-recommendations'] });
          setAddingTemplateId(null);
        },
        onError: () => {
          toast.error('Unable to add goal. Please try again.');
          setAddingTemplateId(null);
        },
      }
    );
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateGoalInput> }) =>
      goalService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      toast.success('Goal updated.');
      setEditingGoal(null);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update goal.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      queryClient.invalidateQueries({ queryKey: ['goal-recommendations'] });
      toast.success('Goal deleted.');
      setDeletingGoalId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete goal.');
    },
  });

  const milestoneMutation = useMutation({
    mutationFn: ({
      goalId,
      milestoneId,
      status,
    }: {
      goalId: string;
      milestoneId: string;
      status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    }) => goalService.updateMilestoneStatus(goalId, milestoneId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals'] });
      queryClient.invalidateQueries({ queryKey: ['progress-timeline'] });
      toast.success('Milestone updated.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update milestone.');
    },
  });

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('SKILL');
    setFormTargetValue(1);
    setFormUnit('milestones');
    setFormDeadline('');
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDescription(goal.description || '');
    setFormCategory(goal.category);
    setFormTargetValue(goal.targetValue || 1);
    setFormUnit(goal.unit || 'milestones');
    setFormDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a goal title.');
      return;
    }

    if (editingGoal) {
      updateMutation.mutate({
        id: editingGoal._id,
        data: {
          title: formTitle.trim(),
          description: formDescription,
          category: formCategory,
          targetValue: formTargetValue,
          unit: formUnit,
          deadline: formDeadline || undefined,
        },
      });
    } else {
      createMutation.mutate({
        title: formTitle.trim(),
        description: formDescription,
        category: formCategory,
        targetValue: formTargetValue,
        unit: formUnit,
        deadline: formDeadline || undefined,
      });
    }
  };

  const categoriesList: { label: string; value: string }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Skill', value: 'SKILL' },
    { label: 'Learning', value: 'LEARNING' },
    { label: 'Assessment', value: 'ASSESSMENT' },
    { label: 'DSA', value: 'DSA' },
    { label: 'Project', value: 'PROJECT' },
    { label: 'Interview', value: 'INTERVIEW' },
    { label: 'Study', value: 'STUDY' },
  ];

  const currentCareerGoal = data?.currentCareerGoal;

  return (
    <PageWrapper className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <Target className="h-7 w-7 text-[#FFD400]" />
            GOALS & MILESTONES
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-sans">
            Turn your career goal into measurable steps and track your preparation progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-xs font-mono font-bold uppercase"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            variant="primary"
            className="font-bold gap-2 text-xs uppercase"
          >
            <Plus className="h-4 w-4 text-black" />
            Create Goal
          </Button>
        </div>
      </div>

      {/* CAREER GOAL HEADER BANNER */}
      <Card className="border-white/10 bg-[#0A0A0A] text-white rounded-sm overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-l-4 border-l-[#FFD400]">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#FFD400] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD400]" />
              CURRENT CAREER GOAL
            </span>

            {currentCareerGoal?.targetRole ? (
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 uppercase">
                  🎯 {currentCareerGoal.targetRole}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
                  Your goals are aligned with your target career pathway.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-extrabold text-white uppercase">
                  No Target Career Goal Selected
                </h2>
                <p className="text-xs text-[#FFD400] mt-1 font-mono">
                  Set your target career role to unlock personalized, career-aligned goal recommendations.
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0">
            {currentCareerGoal?.targetRole ? (
              <Link href="/career-goal">
                <Button variant="secondary" className="font-mono font-bold text-xs gap-2 uppercase">
                  <Target className="h-4 w-4" />
                  View Role Details
                </Button>
              </Link>
            ) : (
              <Link href="/career-goal">
                <Button variant="primary" className="font-bold text-xs gap-2 uppercase">
                  <Target className="h-4 w-4 text-black" />
                  Set Career Goal
                  <ArrowRight className="h-3.5 w-3.5 text-black" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HERO SUMMARY CARDS */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
            <div className="text-3xl font-black text-card-foreground">
              {data.summary.totalGoals}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Goals</div>
          </div>

          <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
            <div className="text-3xl font-black text-[#FFD400]">
              {data.summary.activeCount}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Active Goals</div>
          </div>

          <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
            <div className="text-3xl font-black text-emerald-500 dark:text-emerald-400">
              {data.summary.completedCount}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Completed Goals</div>
          </div>

          <div className="p-4 rounded-sm bg-surface-secondary border border-border text-center space-y-1">
            <div className="text-3xl font-black text-rose-500 dark:text-rose-400">
              {data.summary.overdueCount}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Overdue Goals</div>
          </div>
        </div>
      )}

      {/* SUGGESTED GOALS / RECOMMENDATIONS DRAWER */}
      {recommendations.length > 0 && (
        <Card className="rounded-sm">
          <CardHeader className="p-6 pb-3 border-b border-border">
            <CardTitle className="text-xl font-extrabold uppercase text-[#FFD400] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FFD400]" />
              CAREER-ALIGNED GOAL TEMPLATES ({currentCareerGoal?.targetRole || 'RECOMMENDED'})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
            {recommendations.map((rec) => {
              const isAddingThis = addingTemplateId === rec.templateId;
              const isAlreadyAdded = rec.isAdded;

              return (
                <div
                  key={rec.templateId}
                  className="p-4 rounded-sm bg-surface-secondary border border-border flex flex-col justify-between gap-3 font-sans"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-card-foreground uppercase">{rec.title}</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 uppercase">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                  </div>

                  {isAlreadyAdded ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="w-full text-[11px] font-mono font-bold gap-1.5 border-[#FFD400]/40 bg-[#FFD400]/10 text-[#FFD400] opacity-90 cursor-not-allowed h-8 uppercase"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD400]" />
                      ✓ Added to My Goals
                    </Button>
                  ) : isAddingThis ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled
                      className="w-full text-[11px] font-mono font-bold gap-1.5 h-8 opacity-80 cursor-wait uppercase"
                    >
                      <RotateCw className="h-3.5 w-3.5 animate-spin text-[#FFD400]" />
                      Adding...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddTemplateGoal(rec)}
                      disabled={!!addingTemplateId}
                      className="w-full text-[11px] font-mono font-bold gap-1.5 h-8 transition-all uppercase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to My Goals
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* FILTER & SORT BAR */}
      <div className="flex flex-col gap-4 p-4 rounded-sm bg-surface-secondary border border-border font-mono">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-4 w-4 text-[#FFD400] shrink-0 mr-1" />
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
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

        {/* Status & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background border border-input text-xs font-bold text-foreground rounded-sm px-2.5 py-1 focus:outline-none focus:border-[#FFD400]"
            >
              <option value="ALL">All Goals</option>
              <option value="ACTIVE">Active Goals</option>
              <option value="COMPLETED">Completed Goals</option>
              <option value="OVERDUE">Overdue Goals</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#FFD400]" />
            <span className="text-xs font-bold text-muted-foreground uppercase">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-background border border-input text-xs font-bold text-foreground rounded-sm px-2.5 py-1 focus:outline-none focus:border-[#FFD400]"
            >
              <option value="active_first">Active First</option>
              <option value="deadline">Closest Deadline</option>
              <option value="progress">Highest Progress</option>
              <option value="recently_updated">Recently Updated</option>
              <option value="created_date">Creation Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-sm bg-surface-secondary" />
          <Skeleton className="h-48 rounded-sm bg-surface-secondary" />
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-500/40 text-center p-8 rounded-sm space-y-4 max-w-md mx-auto font-mono text-card-foreground">
          <div className="h-12 w-12 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase text-card-foreground">Unable to load goals</h3>
            <p className="text-xs text-muted-foreground mt-1 font-sans">Please check your connection and try again.</p>
          </div>
          <Button onClick={() => refetch()} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase">
            Try Again
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.goals.length === 0 && !isLoading && !error && (
        <Card className="text-center p-12 rounded-sm space-y-4 max-w-lg mx-auto font-mono text-card-foreground">
          <div className="h-16 w-16 rounded-sm bg-surface-secondary text-[#FFD400] flex items-center justify-center mx-auto border border-[#FFD400]/40">
            <Target className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase text-card-foreground tracking-tight">
              NO GOALS YET
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              Create your first goal and turn your career plan into measurable milestones.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            variant="primary"
            className="font-bold text-xs uppercase gap-2 px-6 rounded-sm mt-2"
          >
            <Plus className="h-4 w-4 text-black" />
            Create Goal
          </Button>
        </Card>
      )}

      {/* GOALS GRID */}
      {data && data.goals.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {data.goals.map((goal: Goal) => {
              const isExpanded = expandedGoalId === goal._id;
              const deadlineInfo = formatDeadline(goal.deadline);
              const badgeClass = getCategoryBadgeColor(goal.category);
              const statusBadge = getStatusBadge(goal.status);
              const completedMsCount = goal.milestones.filter((m) => m.status === 'COMPLETED').length;

              const isPreviousRole =
                currentCareerGoal?.targetRole &&
                goal.careerRoleName &&
                goal.careerRoleName !== currentCareerGoal.targetRole;

              return (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="rounded-sm overflow-hidden flex flex-col justify-between">
                    <CardHeader className="p-6 pb-3 space-y-2">
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                            {goal.category}
                          </span>
                          {statusBadge}
                          {goal.isSystemRecommended && (
                            <Badge variant="default" className="text-[10px] font-mono font-bold uppercase bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40 gap-1">
                              <Sparkles className="h-3 w-3 text-[#FFD400]" /> Career-Aligned
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(goal)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingGoalId(goal._id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2 uppercase">
                          🎯 {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-1 font-sans line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Role Change Banner */}
                      {isPreviousRole && (
                        <div className="text-[10px] font-mono font-bold text-[#FFD400] bg-surface-secondary p-2 rounded-sm border border-[#FFD400]/40 uppercase">
                          Role History: Created for target role "{goal.careerRoleName}"
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="p-6 pt-0 space-y-4">
                      {/* Progress Bar & Numeric Text */}
                      <div className="space-y-1.5 font-mono">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-muted-foreground uppercase">Progress</span>
                          <span className="font-black text-lg text-[#FFD400]">
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-1.5 bg-background" />
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground font-bold">
                          <span>
                            {goal.milestones.length > 0
                              ? `${completedMsCount} / ${goal.milestones.length} Milestones Completed`
                              : `${goal.currentValue || 0} / ${goal.targetValue || 1} ${goal.unit || 'items'}`}
                          </span>
                          {goal.deadline && (
                            <span className={deadlineInfo.isOverdue ? 'text-rose-500 font-bold' : ''}>
                              {deadlineInfo.text}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestones Accordion */}
                      {goal.milestones.length > 0 && (
                        <div className="border-t border-border pt-3 space-y-2">
                          <button
                            onClick={() => setExpandedGoalId(isExpanded ? null : goal._id)}
                            className="w-full flex items-center justify-between text-xs font-mono font-bold text-muted-foreground hover:text-[#FFD400] uppercase transition-colors"
                          >
                            <span>Milestones ({goal.milestones.length})</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          {isExpanded && (
                            <div className="space-y-2 pt-1 font-sans">
                              {goal.milestones.map((ms: Milestone) => {
                                const isDone = ms.status === 'COMPLETED';
                                const isAuto = ms.type === 'AUTOMATIC' || ms.autoSource !== 'MANUAL';

                                return (
                                  <div
                                    key={ms.milestoneId}
                                    className={`p-2.5 rounded-sm border text-xs flex items-start justify-between gap-3 transition-all ${
                                      isDone
                                        ? 'bg-surface-secondary border-[#FFD400]/40'
                                        : 'bg-background border-border'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <button
                                        disabled={isAuto}
                                        onClick={() => {
                                          if (isAuto) return;
                                          milestoneMutation.mutate({
                                            goalId: goal._id,
                                            milestoneId: ms.milestoneId,
                                            status: isDone ? 'NOT_STARTED' : 'COMPLETED',
                                          });
                                        }}
                                        className="mt-0.5 shrink-0"
                                      >
                                        {isDone ? (
                                          <CheckSquare className="h-4 w-4 text-[#FFD400]" />
                                        ) : (
                                          <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        )}
                                      </button>
                                      <div>
                                        <div className={`font-bold ${isDone ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>
                                          {ms.title}
                                        </div>
                                        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                          {isAuto ? (
                                            <span className="flex items-center gap-1 text-[#FFD400] font-bold uppercase">
                                              <Lock className="h-3 w-3" /> Auto-tracked ({ms.currentValue} / {ms.targetValue} {ms.unit})
                                            </span>
                                          ) : (
                                            <span>Manual Checklist</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {isDone && ms.completedAt && (
                                      <span className="text-[10px] font-mono font-bold text-[#FFD400] shrink-0">
                                        ✓ {new Date(ms.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CREATE / EDIT GOAL MODAL */}
      {(isCreateModalOpen || editingGoal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-sm p-6 sm:p-8 max-w-lg w-full text-card-foreground space-y-5 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xl font-extrabold uppercase text-card-foreground">
                {editingGoal ? 'Edit Goal' : 'Create New Preparation Goal'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingGoal(null);
                }}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="font-bold text-card-foreground uppercase block mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master SQL & Relational Databases"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                />
              </div>

              <div>
                <label className="font-bold text-card-foreground uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your goal objective..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-card-foreground uppercase block mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                    className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                  >
                    <option value="SKILL">Skill</option>
                    <option value="LEARNING">Learning</option>
                    <option value="ASSESSMENT">Assessment</option>
                    <option value="DSA">DSA</option>
                    <option value="PROJECT">Project</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="STUDY">Study</option>
                    <option value="CAREER">Career</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-card-foreground uppercase block mb-1">Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-card-foreground uppercase block mb-1">Target Value</label>
                  <input
                    type="number"
                    min={1}
                    value={formTargetValue}
                    onChange={(e) => setFormTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                  />
                </div>

                <div>
                  <label className="font-bold text-card-foreground uppercase block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. topics / problems / %"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-background border border-input text-foreground font-mono text-xs focus:outline-none focus:border-[#FFD400]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingGoal(null);
                  }}
                  className="text-xs uppercase"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  variant="primary"
                  className="font-bold text-xs uppercase"
                >
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingGoalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-rose-500/40 rounded-sm p-6 max-w-sm w-full text-card-foreground text-center space-y-4"
          >
            <div className="h-12 w-12 rounded-sm bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold uppercase text-card-foreground">Delete this goal?</h3>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              This will remove the goal definition. Underlying assessment, learning, and skill data will NOT be deleted.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingGoalId(null)}
                className="w-full text-xs uppercase"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => deleteMutation.mutate(deletingGoalId)}
                isLoading={deleteMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase"
              >
                Delete Goal
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}

