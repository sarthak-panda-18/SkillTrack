'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User as UserIcon,
  GraduationCap,
  Building,
  Target,
  Edit,
  Plus,
  Trash2,
  Code,
  Award,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { skillService } from '@/services/skill.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CollegeSelect } from '@/components/ui/CollegeSelect';
import { CareerRoleSelect } from '@/components/ui/CareerRoleSelect';
import { SkillSelect } from '@/components/ui/SkillSelect';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().min(2, 'College selection is required'),
  degree: z.string().min(1, 'Degree is required'),
  branch: z.string().min(1, 'Branch is required'),
  graduationYear: z.coerce.number().min(2024).max(2032),
  targetRole: z.string().min(1, 'Target role is required'),
  targetCareerRoleId: z.string().optional(),
  targetDomain: z.string().min(1, 'Target domain is required'),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillProficiency, setSkillProficiency] = useState(70);

  // Fetch user profile and user skills
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userService.getProfile(),
  });

  // Fetch catalog skills with 5-min staleTime
  const {
    data: catalogSkills = [],
    isLoading: isLoadingSkills,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ['catalogSkills'],
    queryFn: () => skillService.getAllSkills(),
  });

  const { register, control, setValue, handleSubmit, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    values: {
      name: user?.name || '',
      college: user?.college || '',
      degree: user?.degree || 'B.Tech',
      branch: user?.branch || 'Computer Science & Engineering',
      graduationYear: user?.graduationYear || new Date().getFullYear() + 1,
      targetRole: user?.targetRole || 'Software Development Engineer',
      targetCareerRoleId: (user as any)?.targetCareerRoleId || '',
      targetDomain: user?.targetDomain || 'Software Development',
      experienceLevel: (user?.experienceLevel || 'Intermediate') as any,
    },
  });

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: EditProfileFormData) => userService.updateProfile(data),
    onSuccess: async () => {
      await refetchUser();
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['career-intelligence'] });
      queryClient.invalidateQueries({ queryKey: ['skill-gap-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['learning-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['study-plan'] });
      queryClient.invalidateQueries({ queryKey: ['adaptive-learning'] });
      toast.success('Profile updated successfully!');
      setIsEditOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  // User Skill Add/Update Mutation
  const addSkillMutation = useMutation({
    mutationFn: () => skillService.addUserSkill(selectedSkillId, skillProficiency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Technical skill added/updated!');
      setIsAddSkillOpen(false);
      setSelectedSkillId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save skill.');
    },
  });

  // User Skill Remove Mutation
  const removeSkillMutation = useMutation({
    mutationFn: (skillId: string) => skillService.removeUserSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Skill removed from profile.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove skill.');
    },
  });

  const onEditSubmit = (data: EditProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onAddSkillSubmit = () => {
    if (!selectedSkillId) {
      toast.error('Please select a skill from the catalog.');
      return;
    }
    addSkillMutation.mutate();
  };

  const profileUser = profileData?.user || user;
  const userSkills = profileData?.skills || [];
  const profileCompletion = profileUser?.profileCompletion || 20;

  const getProficiencyLevel = (score: number) => {
    if (score < 40) return 'Beginner';
    if (score < 75) return 'Intermediate';
    return 'Advanced';
  };

  const selectedSkillObj = catalogSkills.find((s) => s._id === selectedSkillId);

  return (
    <PageWrapper className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Student Engineering Profile
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your academic credentials, career aspirations, and verified skill ratings.
          </p>
        </div>

        <Button onClick={() => setIsEditOpen(true)} className="gap-2 shrink-0">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Main Profile Summary Card */}
      <Card className="overflow-hidden border-zinc-200/80 dark:border-zinc-800">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-indigo-600 shadow-md">
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-2xl">
                {profileUser?.name?.charAt(0).toUpperCase() || 'S'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {profileUser?.name}
                </h2>
                <Badge variant="purple" className="text-xs font-semibold">
                  {profileUser?.experienceLevel || 'Intermediate'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-zinc-500 truncate">{profileUser?.email}</p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5 truncate">
                  <Building className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{profileUser?.college || 'Institution pending'}</span>
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">
                    {profileUser?.degree} • {profileUser?.branch} ({profileUser?.graduationYear})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                Profile Placement Readiness Completion
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                {profileCompletion}%
              </span>
            </div>
            <Progress value={profileCompletion} className="h-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Academic & Target Role Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">College</div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {profileUser?.college || 'Not specified'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Degree & Year</div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {profileUser?.degree} ({profileUser?.graduationYear})
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Role</div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {profileUser?.targetRole || 'Full Stack Engineer'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Domain</div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {profileUser?.targetDomain || 'Web Development'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Verified Skills Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Verified Technical Skills ({userSkills.length})
            </CardTitle>
            <CardDescription>
              Technical proficiencies evaluated against engineering benchmarks.
            </CardDescription>
          </div>

          <Button onClick={() => setIsAddSkillOpen(true)} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Add / Update Skill
          </Button>
        </CardHeader>

        <CardContent>
          {userSkills.length === 0 ? (
            <div className="text-center py-10 space-y-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <Code className="h-10 w-10 text-zinc-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">No technical skills added yet</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Add programming languages, frameworks, or engineering subjects to start skill gap evaluation.
                </p>
              </div>
              <Button onClick={() => setIsAddSkillOpen(true)} size="sm" className="gap-1 text-xs">
                <Plus className="h-4 w-4" />
                Add Your First Skill
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSkills.map((item: any) => {
                const skill = item.skillId || {};
                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-500/50 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{skill.name}</h4>
                        <span className="text-[11px] text-zinc-400 font-medium">{skill.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px] py-0">
                          {item.level || getProficiencyLevel(item.proficiency)}
                        </Badge>
                        <button
                          onClick={() => removeSkillMutation.mutate(skill._id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove skill"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-500 text-[11px]">Proficiency</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.proficiency}%</span>
                      </div>
                      <Progress value={item.proficiency} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Engineering Profile</DialogTitle>
            <DialogDescription>
              Update your institution, degree program, and career goals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />

            {/* Searchable Engineering College Selector */}
            <Controller
              name="college"
              control={control}
              render={({ field }) => (
                <CollegeSelect
                  label="College / University Name"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.college?.message}
                />
              )}
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
                {...register('degree')}
                error={errors.degree?.message}
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
                {...register('graduationYear')}
                error={errors.graduationYear?.message}
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
              ]}
              {...register('branch')}
              error={errors.branch?.message}
            />

            <Controller
              name="targetRole"
              control={control}
              render={({ field }) => (
                <CareerRoleSelect
                  label="Target Engineering Role"
                  value={field.value}
                  onChange={(roleName, roleObj) => {
                    field.onChange(roleName);
                    if (roleObj) {
                      setValue('targetCareerRoleId', roleObj._id);
                      if (roleObj.category) {
                        setValue('targetDomain', roleObj.category);
                      }
                    }
                  }}
                  error={errors.targetRole?.message}
                />
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateProfileMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add / Update Technical Skill Modal */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add / Update Technical Skill</DialogTitle>
            <DialogDescription>
              Select a skill from the engineering catalog and set your current proficiency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Custom Category-Grouped Premium Skill Selector Combobox */}
            <SkillSelect
              label="Select Technical Skill"
              skills={catalogSkills}
              value={selectedSkillId}
              onChange={(skillId) => setSelectedSkillId(skillId)}
              isLoading={isLoadingSkills}
              isError={isSkillsError}
              onRetry={refetchSkills}
            />

            {selectedSkillObj && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs space-y-1">
                <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                  <span>{selectedSkillObj.name}</span>
                  <Badge variant="purple" className="text-[10px] uppercase">
                    {selectedSkillObj.category}
                  </Badge>
                </div>
                {selectedSkillObj.description && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed pt-1">
                    {selectedSkillObj.description}
                  </p>
                )}
              </div>
            )}

            {/* Proficiency Slider & Rating Display */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Proficiency Score
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {getProficiencyLevel(skillProficiency)}
                  </Badge>
                  <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                    {skillProficiency}%
                  </span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={skillProficiency}
                onChange={(e) => setSkillProficiency(parseInt(e.target.value))}
                className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>Beginner (10%)</span>
                <span>Intermediate (50%)</span>
                <span>Advanced (100%)</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onAddSkillSubmit}
              isLoading={addSkillMutation.isPending}
              disabled={!selectedSkillId || isLoadingSkills}
            >
              {addSkillMutation.isPending ? 'Saving skill...' : 'Save Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
