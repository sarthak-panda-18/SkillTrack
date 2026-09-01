'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Filter,
  ArrowUpDown,
  Sparkles,
  BookOpen,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Lock,
  RotateCw,
  AlertCircle,
  Award,
  ArrowRight,
  CheckSquare,
  Square,
  Layers,
  Flag,
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
  switch (category) {
    case 'SKILL':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'LEARNING':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800';
    case 'ASSESSMENT':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'CAREER':
    case 'INTERVIEW':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'PROJECT':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  }
}

function getStatusBadge(status: GoalStatus) {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success" className="text-[10px] font-extrabold uppercase">✓ Completed</Badge>;
    case 'OVERDUE':
      return <Badge variant="rose" className="text-[10px] font-extrabold uppercase">Overdue</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="default" className="text-[10px] font-extrabold uppercase">In Progress</Badge>;
    default:
      return <Badge variant="secondary" className="text-[10px] font-extrabold uppercase">Not Started</Badge>;
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Target className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            GOALS & MILESTONES
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Turn your career goal into measurable steps and track your preparation progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2 text-xs"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-xs shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Create Goal
          </Button>
        </div>
      </div>

      {/* CAREER GOAL HEADER BANNER */}
      <Card className="border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-950 text-white shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              CURRENT CAREER GOAL
            </span>

            {currentCareerGoal?.targetRole ? (
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  🎯 {currentCareerGoal.targetRole}
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                  Your goals are aligned with your target career pathway.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  No Target Career Goal Selected
                </h2>
                <p className="text-xs text-amber-200 mt-1">
                  Set your target career role to unlock personalized, career-aligned goal recommendations.
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0">
            {currentCareerGoal?.targetRole ? (
              <Link href="/career-goal">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold text-xs gap-2">
                  <Target className="h-4 w-4" />
                  View Role Details
                </Button>
              </Link>
            ) : (
              <Link href="/career-goal">
                <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs gap-2 shadow-lg">
                  <Target className="h-4 w-4" />
                  Set Career Goal
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HERO SUMMARY CARDS */}
      {data?.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              {data.summary.totalGoals}
            </div>
            <div className="text-xs font-semibold text-zinc-500">Total Goals</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {data.summary.activeCount}
            </div>
            <div className="text-xs font-semibold text-zinc-500">Active Goals</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {data.summary.completedCount}
            </div>
            <div className="text-xs font-semibold text-zinc-500">Completed Goals</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs text-center space-y-1">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {data.summary.overdueCount}
            </div>
            <div className="text-xs font-semibold text-zinc-500">Overdue Goals</div>
          </div>
        </div>
      )}

      {/* SUGGESTED GOALS / RECOMMENDATIONS DRAWER */}
      {recommendations.length > 0 && (
        <Card className="border-amber-200/80 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              Career-Aligned Goal Templates ({currentCareerGoal?.targetRole || 'Recommended'})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
            {recommendations.map((rec) => {
              const isAddingThis = addingTemplateId === rec.templateId;
              const isAlreadyAdded = rec.isAdded;

              return (
                <div
                  key={rec.templateId}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rec.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">{rec.description}</p>
                  </div>

                  {isAlreadyAdded ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full text-[11px] font-bold gap-1.5 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 opacity-90 cursor-not-allowed h-8 shadow-2xs"
                    >
                      <motion.span
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 font-extrabold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ✓ Added to My Goals
                      </motion.span>
                    </Button>
                  ) : isAddingThis ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full text-[11px] font-bold gap-1.5 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 h-8 opacity-80 cursor-wait"
                    >
                      <RotateCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                      Adding...
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTemplateGoal(rec)}
                      disabled={!!addingTemplateId}
                      className="w-full text-[11px] font-bold gap-1.5 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 h-8 transition-all"
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
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="h-4 w-4 text-zinc-400 shrink-0 mr-1" />
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Goals</option>
              <option value="ACTIVE">Active Goals</option>
              <option value="COMPLETED">Completed Goals</option>
              <option value="OVERDUE">Overdue Goals</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <Card className="border-rose-200 bg-rose-50/50 text-center p-8 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">Unable to load goals.</h3>
            <p className="text-xs text-zinc-500 mt-1">Please check your connection and try again.</p>
          </div>
          <Button onClick={() => refetch()} className="bg-rose-600 text-white font-bold text-xs">
            Try Again
          </Button>
        </Card>
      )}

      {/* EMPTY STATE */}
      {data && data.goals.length === 0 && !isLoading && !error && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center p-12 rounded-3xl space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
            <Target className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              NO GOALS YET
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create your first goal and turn your career plan into measurable milestones.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 px-6 rounded-xl mt-2"
          >
            <Plus className="h-4 w-4" />
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
                  <Card className="border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
                    <CardHeader className="pb-3 space-y-2">
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${badgeClass}`}>
                            {goal.category}
                          </span>
                          {statusBadge}
                          {goal.isSystemRecommended && (
                            <Badge variant="purple" className="text-[10px] font-extrabold gap-1">
                              <Sparkles className="h-3 w-3" /> Career-Aligned
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(goal)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingGoalId(goal._id)}
                            className="h-7 w-7 p-0 text-zinc-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          🎯 {goal.title}
                        </h3>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Role Change Banner */}
                      {isPreviousRole && (
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          Role History: Created for target role "{goal.careerRoleName}"
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* Progress Bar & Numeric Text */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-500">Progress</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400">
                            {goal.progress}%
                          </span>
                        </div>
                        <Progress value={goal.progress} className="h-2 rounded-full" />
                        <div className="flex justify-between items-center text-[11px] text-zinc-400 font-medium">
                          <span>
                            {goal.milestones.length > 0
                              ? `${completedMsCount} / ${goal.milestones.length} Milestones Completed`
                              : `${goal.currentValue || 0} / ${goal.targetValue || 1} ${goal.unit || 'items'}`}
                          </span>
                          {goal.deadline && (
                            <span className={deadlineInfo.isOverdue ? 'text-rose-600 font-bold' : ''}>
                              {deadlineInfo.text}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestones Accordion */}
                      {goal.milestones.length > 0 && (
                        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
                          <button
                            onClick={() => setExpandedGoalId(isExpanded ? null : goal._id)}
                            className="w-full flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
                          >
                            <span>Milestones ({goal.milestones.length})</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          {isExpanded && (
                            <div className="space-y-2 pt-1">
                              {goal.milestones.map((ms: Milestone) => {
                                const isDone = ms.status === 'COMPLETED';
                                const isAuto = ms.type === 'AUTOMATIC' || ms.autoSource !== 'MANUAL';

                                return (
                                  <div
                                    key={ms.milestoneId}
                                    className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-3 transition-all ${
                                      isDone
                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                        : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800'
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
                                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                          <Square className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
                                        )}
                                      </button>
                                      <div>
                                        <div className={`font-bold ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                          {ms.title}
                                        </div>
                                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                          {isAuto ? (
                                            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                                              <Lock className="h-3 w-3" /> Auto-tracked ({ms.currentValue} / {ms.targetValue} {ms.unit})
                                            </span>
                                          ) : (
                                            <span>Manual Checklist</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {isDone && ms.completedAt && (
                                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                {editingGoal ? 'Edit Goal' : 'Create New Preparation Goal'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingGoal(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master SQL & Relational Databases"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your goal objective..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Value</label>
                  <input
                    type="number"
                    min={1}
                    value={formTargetValue}
                    onChange={(e) => setFormTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. topics / problems / %"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingGoal(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Delete this goal?</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              This will remove the goal definition. Underlying assessment, learning, and skill data will NOT be deleted.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingGoalId(null)}
                className="w-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => deleteMutation.mutate(deletingGoalId)}
                isLoading={deleteMutation.isPending}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
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
