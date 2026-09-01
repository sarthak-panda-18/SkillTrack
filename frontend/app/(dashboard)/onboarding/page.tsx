'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  GraduationCap,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  Building,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { skillService } from '@/services/skill.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CollegeSelect } from '@/components/ui/CollegeSelect';
import { CareerRoleSelect } from '@/components/ui/CareerRoleSelect';
import { SkillSelect } from '@/components/ui/SkillSelect';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refetchUser } = useAuth();
  const [step, setStep] = useState(1);

  // Basic Academic Info
  const [basicInfo, setBasicInfo] = useState({
    college: user?.college || '',
    degree: user?.degree || 'B.Tech',
    branch: user?.branch || 'Computer Science & Engineering',
    graduationYear: user?.graduationYear || new Date().getFullYear() + 1,
  });

  // Target Career Goals
  const [careerGoals, setCareerGoals] = useState({
    targetRole: user?.targetRole || 'Full Stack Engineer',
    targetDomain: user?.targetDomain || 'Web Development',
    experienceLevel: (user?.experienceLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
  });

  // Initial Skills Selection
  const [selectedSkills, setSelectedSkills] = useState<
    { skillId: string; name: string; proficiency: number; level?: 'Beginner' | 'Intermediate' | 'Advanced' }[]
  >([]);
  const [currentSkillId, setCurrentSkillId] = useState('');
  const [currentProficiency, setCurrentProficiency] = useState(70);

  // Fetch catalog skills for onboarding step 3
  const {
    data: catalogSkills = [],
    isLoading: isLoadingSkills,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ['catalogSkills'],
    queryFn: () => skillService.getAllSkills(),
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const onboardingData = {
        ...basicInfo,
        ...careerGoals,
        skills: selectedSkills.map((s) => ({
          skillId: s.skillId,
          proficiency: s.proficiency,
          level: s.level,
        })),
      };
      return userService.completeOnboarding(onboardingData);
    },
    onSuccess: async () => {
      await refetchUser();
      toast.success('Onboarding completed! Welcome to your personalized dashboard.');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete onboarding.');
    },
  });

  const handleAddSkill = () => {
    if (!currentSkillId) return;
    const skillObj = catalogSkills.find((s) => s._id === currentSkillId);
    if (!skillObj) return;

    if (selectedSkills.some((s) => s.skillId === currentSkillId)) {
      toast.info('Skill already added to your list.');
      return;
    }

    let level: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
    if (currentProficiency < 40) level = 'Beginner';
    else if (currentProficiency >= 75) level = 'Advanced';

    setSelectedSkills([
      ...selectedSkills,
      {
        skillId: currentSkillId,
        name: skillObj.name,
        proficiency: currentProficiency,
        level,
      },
    ]);
    setCurrentSkillId('');
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!basicInfo.college) {
        toast.error('College selection is required');
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  return (
    <PageWrapper className="min-h-screen flex flex-col justify-center items-center py-10 px-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-2xl space-y-6">
        {/* Onboarding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/50 dark:border-indigo-800/50">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Step {step} of 4 • Student Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Personalize Your SkillTrack AI Pathway
          </h1>
          <Progress value={(step / 4) * 100} className="h-2 w-full max-w-md mx-auto mt-3" />
        </div>

        <Card className="shadow-xl border-zinc-200/80 dark:border-zinc-800">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* STEP 1: ACADEMIC BACKGROUND */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Academic Background</h2>
                    <p className="text-xs text-zinc-500">Confirm your engineering institution and degree.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Searchable Engineering College Selector */}
                  <CollegeSelect
                    label="College / University Name"
                    value={basicInfo.college}
                    onChange={(val) => setBasicInfo({ ...basicInfo, college: val })}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Degree Program"
                      options={[
                        { label: 'B.Tech', value: 'B.Tech' },
                        { label: 'B.E.', value: 'B.E.' },
                        { label: 'M.Tech', value: 'M.Tech' },
                        { label: 'BCA', value: 'BCA' },
                        { label: 'MCA', value: 'MCA' },
                        { label: 'B.Sc CS', value: 'B.Sc CS' },
                      ]}
                      value={basicInfo.degree}
                      onChange={(e) => setBasicInfo({ ...basicInfo, degree: e.target.value })}
                    />

                    <Select
                      label="Graduation Year"
                      options={[
                        { label: '2024', value: 2024 },
                        { label: '2025', value: 2025 },
                        { label: '2026', value: 2026 },
                        { label: '2027', value: 2027 },
                        { label: '2028', value: 2028 },
                      ]}
                      value={basicInfo.graduationYear}
                      onChange={(e) => setBasicInfo({ ...basicInfo, graduationYear: parseInt(e.target.value) })}
                    />
                  </div>

                  <Select
                    label="Branch / Major"
                    options={[
                      { label: 'Computer Science & Engineering', value: 'Computer Science & Engineering' },
                      { label: 'Information Technology', value: 'Information Technology' },
                      { label: 'Electronics & Communication', value: 'Electronics & Communication' },
                      { label: 'Electrical Engineering', value: 'Electrical Engineering' },
                      { label: 'Data Science & AI', value: 'Data Science & AI' },
                      { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
                    ]}
                    value={basicInfo.branch}
                    onChange={(e) => setBasicInfo({ ...basicInfo, branch: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: CAREER GOALS */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Placement Target & Role</h2>
                    <p className="text-xs text-zinc-500">Define your dream career path for AI gap benchmarking.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CareerRoleSelect
                    label="Target Engineering Role"
                    value={careerGoals.targetRole}
                    onChange={(roleName, roleObj) => {
                      setCareerGoals({
                        ...careerGoals,
                        targetRole: roleName,
                        targetDomain: roleObj?.category || careerGoals.targetDomain,
                        targetCareerRoleId: roleObj?._id,
                      } as any);
                    }}
                  />

                  <Select
                    label="Domain Specialization"
                    options={[
                      { label: 'Web Development', value: 'Web Development' },
                      { label: 'Artificial Intelligence & ML', value: 'Artificial Intelligence & ML' },
                      { label: 'Cloud Infrastructure & DevOps', value: 'Cloud Infrastructure & DevOps' },
                      { label: 'Mobile Development', value: 'Mobile Development' },
                      { label: 'Cybersecurity', value: 'Cybersecurity' },
                    ]}
                    value={careerGoals.targetDomain}
                    onChange={(e) => setCareerGoals({ ...careerGoals, targetDomain: e.target.value })}
                  />

                  <Select
                    label="Self-Assessed Experience Level"
                    options={[
                      { label: 'Beginner (0-1 years coding experience)', value: 'Beginner' },
                      { label: 'Intermediate (1-3 years building projects)', value: 'Intermediate' },
                      { label: 'Advanced (3+ years advanced engineering)', value: 'Advanced' },
                    ]}
                    value={careerGoals.experienceLevel}
                    onChange={(e) => setCareerGoals({ ...careerGoals, experienceLevel: e.target.value as any })}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: INITIAL SKILL SELECTION */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Add Technical Skills</h2>
                    <p className="text-xs text-zinc-500">Pick your core skills and set proficiency ratings.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <SkillSelect
                      label="Select Skill from Catalog"
                      skills={catalogSkills}
                      value={currentSkillId}
                      onChange={(skillId) => setCurrentSkillId(skillId)}
                      isLoading={isLoadingSkills}
                      isError={isSkillsError}
                      onRetry={refetchSkills}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-zinc-500 font-medium">
                        Proficiency Rating: <strong className="text-indigo-600 dark:text-indigo-400">{currentProficiency}%</strong>
                      </span>
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!currentSkillId}
                        size="sm"
                        className="gap-1 text-xs"
                      >
                        Add Skill to List
                      </Button>
                    </div>
                  </div>

                  {/* Selected Skills Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedSkills.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">No skills added yet. Add at least 1 skill to proceed.</p>
                    ) : (
                      selectedSkills.map((s) => (
                        <span
                          key={s.skillId}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800 text-xs font-semibold"
                        >
                          {s.name} ({s.proficiency}%)
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Review & Launch Pathway</h2>
                    <p className="text-xs text-zinc-500">Confirm your setup to initialize AI gap analysis.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Institution</span>
                    <p className="text-zinc-500">{basicInfo.college}</p>
                    <p className="text-zinc-500">{basicInfo.degree} in {basicInfo.branch} ({basicInfo.graduationYear})</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Career Target</span>
                    <p className="text-zinc-500">{careerGoals.targetRole}</p>
                    <p className="text-zinc-500">{careerGoals.targetDomain} • {careerGoals.experienceLevel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                disabled={step === 1}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button onClick={handleNextStep} className="gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => completeOnboardingMutation.mutate()}
                  isLoading={completeOnboardingMutation.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
