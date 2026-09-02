'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Award,
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
        <Skeleton className="h-44 w-full rounded-sm bg-[#0A0A0A]" />
        <Skeleton className="h-64 w-full rounded-sm bg-[#0A0A0A]" />
      </PageWrapper>
    );
  }

  if (isProfileError || !user) {
    return (
      <PageWrapper className="max-w-5xl mx-auto py-12 text-center space-y-4 font-mono">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">
          Unable to load your Career Goal.
        </h2>
        <Button variant="outline" size="sm" onClick={() => refetchProfile()} className="gap-2 text-xs uppercase border-white/20 text-white">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Target className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>SINGLE TARGET ROLE SOURCE OF TRUTH</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            CAREER GOAL
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-sans">
            Define the career you're preparing for and keep your entire SkillTrack journey aligned.
          </p>
        </div>
      </div>

      {/* Main Hero Goal Card */}
      <Card className="bg-[#0A0A0A] border-2 border-[#FFD400]/40 text-white rounded-sm">
        <CardContent className="p-6 sm:p-8">
          {hasTargetGoal ? (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-[#FFD400]">
                  YOUR CURRENT CAREER GOAL
                </span>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-sm bg-[#FFD400] text-black flex items-center justify-center font-bold">
                    <Target className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h2 className="font-condensed text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                      {targetRoleName}
                    </h2>
                    <Badge variant="default" className="text-[10px] font-mono uppercase font-bold mt-1 bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40">
                      Domain: {targetDomain}
                    </Badge>
                  </div>
                </div>

                {currentRoleObj?.description && (
                  <p className="text-xs text-zinc-400 max-w-2xl pt-1 font-sans">
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
                className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2 shrink-0 font-mono"
              >
                <RefreshCw className="h-4 w-4 text-black" /> Change Career Goal
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4 font-mono">
              <div className="h-16 w-16 rounded-sm bg-[#111111] text-[#FFD400] mx-auto flex items-center justify-center border border-[#FFD400]/40">
                <Target className="h-8 w-8 text-[#FFD400]" />
              </div>
              <div className="space-y-1">
                <h2 className="font-condensed text-2xl font-extrabold uppercase text-white">
                  No Career Goal Set
                </h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto font-sans">
                  Choose a target career role to personalize your SkillTrack experience across assessments, roadmaps, and study schedules.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-2"
              >
                Set Career Goal <ArrowRight className="h-4 w-4 text-black" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alignment Journey Pathway Card */}
      <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm font-mono">
        <CardHeader className="p-6 pb-3 border-b border-white/10">
          <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FFD400]" /> SKILLTRACK JOURNEY ALIGNMENT
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            How your selected career goal automatically synchronizes intelligent features across SkillTrack.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative font-sans">
            <div className="p-3.5 rounded-sm border border-[#FFD400]/40 bg-[#FFD400]/5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FFD400] uppercase">
                <Target className="h-3.5 w-3.5 text-[#FFD400]" /> 1. Career Goal
              </div>
              <p className="text-[11px] text-zinc-300 font-bold uppercase">
                {targetRoleName}
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-white/10 bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
                <Brain className="h-3.5 w-3.5 text-[#FFD400]" /> 2. Skill Gap
              </div>
              <p className="text-[11px] text-zinc-400">
                Target role skill requirements & readiness score
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-white/10 bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
                <BookOpen className="h-3.5 w-3.5 text-[#FFD400]" /> 3. Learning
              </div>
              <p className="text-[11px] text-zinc-400">
                Personalized YouTube & topic roadmap
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-white/10 bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
                <Calendar className="h-3.5 w-3.5 text-[#FFD400]" /> 4. Study Plan
              </div>
              <p className="text-[11px] text-zinc-400">
                Role-aligned study schedule
              </p>
            </div>

            <div className="p-3.5 rounded-sm border border-white/10 bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
                <LineChart className="h-3.5 w-3.5 text-[#FFD400]" /> 5. Progress
              </div>
              <p className="text-[11px] text-zinc-400">
                Preparation & readiness analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Details & Core Required Skills Grid */}
      {currentRoleObj && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Required Core Skills Card */}
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
            <CardHeader className="p-6 pb-3 border-b border-white/10">
              <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FFD400]" /> CORE REQUIRED SKILLS
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
                        variant="default"
                        className="text-xs py-1 px-3 bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40 font-mono font-bold uppercase"
                      >
                        {skillName}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-zinc-400 font-mono">Core skills catalog available for this role.</div>
              )}
            </CardContent>
          </Card>

          {/* Role Responsibilities Card */}
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
            <CardHeader className="p-6 pb-3 border-b border-white/10">
              <CardTitle className="font-condensed text-xl font-bold uppercase text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#FFD400]" /> ROLE OVERVIEW
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Category Domain</span>
                <div className="font-condensed font-bold text-[#FFD400] text-base uppercase">{currentRoleObj.category || 'Technology'}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Description</span>
                <div className="text-zinc-400 mt-0.5 font-sans">
                  {currentRoleObj.description || 'Prepares students for professional industry standards.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Change Career Goal Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-6 max-w-md w-full space-y-5 shadow-2xl font-mono text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm bg-[#FFD400] text-black flex items-center justify-center font-bold shrink-0">
                <Target className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-condensed text-xl font-extrabold uppercase text-white">
                  CHANGE CAREER GOAL?
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Changing your career goal will realign your personalized learning pathway, study schedule, and skill gap metrics.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
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
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs uppercase border-white/20 text-white">
                Keep Current Goal
              </Button>
              <Button
                size="sm"
                isLoading={updateGoalMutation.isPending}
                onClick={handleConfirmChange}
                className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-black" /> Confirm Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

