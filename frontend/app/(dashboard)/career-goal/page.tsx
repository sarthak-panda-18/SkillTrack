'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Target,
  Sparkles,
  ArrowRight,
  Brain,
  BookOpen,
  Calendar,
  LineChart,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { careerRoleService } from '@/services/careerRole.service';
import { CareerRole } from '@/types/careerRole';
import { CareerRoleSelect } from '@/components/ui/CareerRoleSelect';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function CareerGoalPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [selectedRoleObj, setSelectedRoleObj] = useState<CareerRole | undefined>(undefined);

  // Fetch current student profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
  });

  const user = profileData?.user;

  // Fetch career role details catalog
  const { data: careerRoles = [] } = useQuery({
    queryKey: ['publicCareerRoles'],
    queryFn: () => careerRoleService.getPublicCareerRoles(''),
  });

  // Derived current target career role object
  const currentRoleObj = careerRoles.find(
    (r) =>
      r._id === user?.targetCareerRoleId ||
      r.name.toLowerCase() === (user?.targetRole || '').toLowerCase()
  );

  // Update profile target career role mutation
  const updateGoalMutation = useMutation({
    mutationFn: (newRoleId: string) =>
      userService.updateProfile({ targetCareerRoleId: newRoleId as any }),
    onSuccess: () => {
      // Synchronize all dependent feature caches in React Query
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['skill-gap'] });
      queryClient.invalidateQueries({ queryKey: ['learning-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      queryClient.invalidateQueries({ queryKey: ['adaptive-learning'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });

      toast.success('Career Goal updated successfully.');
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update Career Goal.');
    },
  });

  const handleConfirmChange = () => {
    if (!selectedRoleObj && !selectedRoleName) {
      toast.error('Please select a valid target career role.');
      return;
    }

    const targetId = selectedRoleObj?._id || selectedRoleName;
    updateGoalMutation.mutate(targetId);
  };

  if (isProfileLoading) {
    return (
      <PageWrapper className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </PageWrapper>
    );
  }

  if (isProfileError || !user) {
    return (
      <PageWrapper className="max-w-5xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
          Unable to load your Career Goal.
        </h2>
        <Button variant="outline" size="sm" onClick={() => refetchProfile()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </PageWrapper>
    );
  }

  const hasTargetGoal = !!(user.targetRole || currentRoleObj);
  const targetRoleName = currentRoleObj?.name || user.targetRole || 'Not Set';
  const targetDomain = currentRoleObj?.category || user.targetDomain || 'Technology';

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
            <Target className="h-3.5 w-3.5" />
            <span>Single Target Role Source of Truth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Career Goal
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Define the career you're preparing for and keep your entire SkillTrack journey aligned.
          </p>
        </div>
      </div>

      {/* Main Hero Goal Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card className="shadow-lg border-2 border-purple-200 dark:border-purple-900/60 bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-zinc-900 dark:to-indigo-950/20">
          <CardContent className="p-6 sm:p-8">
            {hasTargetGoal ? (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase font-black tracking-widest text-purple-600 dark:text-purple-400">
                    Your Current Career Goal
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {targetRoleName}
                      </h2>
                      <Badge variant="purple" className="text-[10px] uppercase font-bold mt-1">
                        Domain: {targetDomain}
                      </Badge>
                    </div>
                  </div>

                  {currentRoleObj?.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl pt-1">
                      {currentRoleObj.description}
                    </p>
                  )}
                </div>

                <Button
                  size="default"
                  onClick={() => {
                    setSelectedRoleName(targetRoleName);
                    setSelectedRoleObj(currentRoleObj);
                    setIsModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2 shrink-0 shadow-md"
                >
                  <RefreshCw className="h-4 w-4" /> Change Career Goal
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center">
                  <Target className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    No Career Goal Set
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto">
                    Choose a target career role to personalize your SkillTrack experience across assessments, roadmaps, and study schedules.
                  </p>
                </div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2"
                >
                  Set Career Goal <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Alignment Journey Pathway Card */}
      <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" /> Your SkillTrack Journey Alignment
          </CardTitle>
          <CardDescription className="text-xs">
            How your selected career goal automatically synchronizes intelligent features across SkillTrack.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            <div className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700 dark:text-purple-300">
                <Target className="h-3.5 w-3.5 text-purple-600" /> 1. Career Goal
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                {targetRoleName}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                <Brain className="h-3.5 w-3.5 text-indigo-600" /> 2. Skill Gap
              </div>
              <p className="text-[11px] text-zinc-500">
                Target role skill requirements & readiness score
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600" /> 3. Learning
              </div>
              <p className="text-[11px] text-zinc-500">
                Personalized YouTube & topic roadmap
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                <Calendar className="h-3.5 w-3.5 text-blue-600" /> 4. Study Plan
              </div>
              <p className="text-[11px] text-zinc-500">
                Role-aligned study schedule
              </p>
            </div>

            <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                <LineChart className="h-3.5 w-3.5 text-amber-600" /> 5. Progress
              </div>
              <p className="text-[11px] text-zinc-500">
                Preparation & readiness analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Details & Core Required Skills Grid */}
      {currentRoleObj && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Core Skills Card */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" /> Core Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {currentRoleObj.requiredSkills && currentRoleObj.requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentRoleObj.requiredSkills.map((sk: any, idx: number) => {
                    const skillName = typeof sk === 'string' ? sk : sk.name || sk.skillId?.name || 'Skill';
                    return (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs py-1 px-3 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-bold"
                      >
                        {skillName}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-zinc-400">Core skills catalog available for this role.</div>
              )}
            </CardContent>
          </Card>

          {/* Role Responsibilities Card */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" /> Role Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Category Domain</span>
                <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{currentRoleObj.category || 'Technology'}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Description</span>
                <div className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {currentRoleObj.description || 'Prepares students for professional industry standards.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Career Goal Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  Change Career Goal?
                </h3>
                <p className="text-xs text-zinc-500">
                  Changing your career goal will realign your personalized learning pathway, study schedule, and skill gap metrics.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Select Target Career Role
              </label>
              <CareerRoleSelect
                value={selectedRoleName}
                onChange={(name, obj) => {
                  setSelectedRoleName(name);
                  setSelectedRoleObj(obj);
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs">
                Keep Current Goal
              </Button>
              <Button
                size="sm"
                isLoading={updateGoalMutation.isPending}
                onClick={handleConfirmChange}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Goal
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
