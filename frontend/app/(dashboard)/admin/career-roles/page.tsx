'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Power,
  Sliders,
  Trash2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { skillService } from '@/services/skill.service';
import { careerRoleService } from '@/services/careerRole.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
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
import { CareerRole } from '@/types/careerRole';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  level: z.enum(['Entry', 'Mid', 'Senior']),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function AdminCareerRolesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CareerRole | null>(null);

  // Skill Requirements Management State
  const [managingRole, setManagingRole] = useState<CareerRole | null>(null);
  const [reqSkillId, setReqSkillId] = useState('');
  const [reqImportance, setReqImportance] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [reqMinProf, setReqMinProf] = useState(50);
  const [reqRecProf, setReqRecProf] = useState(75);

  // Fetch admin career roles
  const { data, isLoading } = useQuery({
    queryKey: ['adminCareerRoles', search, categoryFilter, page],
    queryFn: () =>
      adminService.getAdminCareerRoles({
        search,
        category: categoryFilter || undefined,
        page,
        limit: 15,
      }),
  });

  // Fetch catalog skills for requirement mapping dropdown
  const { data: catalogSkills = [] } = useQuery({
    queryKey: ['catalogSkills'],
    queryFn: () => skillService.getAllSkills(),
  });

  // Fetch specific role requirements details when managing
  const { data: roleDetail, refetch: refetchRoleDetail } = useQuery({
    queryKey: ['careerRoleDetails', managingRole?._id],
    queryFn: () => careerRoleService.getCareerRoleDetails(managingRole!._id),
    enabled: !!managingRole,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      category: 'Software Development',
      level: 'Entry',
    },
  });

  // Create Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: (formData: RoleFormData) => adminService.createCareerRole(formData),
    onSuccess: (newRole) => {
      queryClient.invalidateQueries({ queryKey: ['adminCareerRoles'] });
      queryClient.invalidateQueries({ queryKey: ['publicCareerRoles'] });
      toast.success(`Career role "${newRole.name}" created!`);
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create career role.');
    },
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: Partial<CareerRole> }) =>
      adminService.updateCareerRole(roleId, data),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['adminCareerRoles'] });
      queryClient.invalidateQueries({ queryKey: ['publicCareerRoles'] });
      toast.success(`Career role "${updatedRole.name}" updated!`);
      setEditingRole(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update career role.');
    },
  });

  // Toggle Role Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (roleId: string) => adminService.toggleCareerRoleStatus(roleId),
    onSuccess: (updatedRole) => {
      queryClient.invalidateQueries({ queryKey: ['adminCareerRoles'] });
      queryClient.invalidateQueries({ queryKey: ['publicCareerRoles'] });
      toast.success(`Career role status updated to ${updatedRole.isActive ? 'Active' : 'Inactive'}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    },
  });

  // Add/Update Role Skill Requirement Mutation
  const addRoleSkillMutation = useMutation({
    mutationFn: () =>
      adminService.addOrUpdateRoleSkill(managingRole!._id, {
        skillId: reqSkillId,
        importance: reqImportance,
        minimumProficiency: reqMinProf,
        recommendedProficiency: reqRecProf,
      }),
    onSuccess: () => {
      refetchRoleDetail();
      toast.success('Skill requirement saved for career role!');
      setReqSkillId('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save requirement.');
    },
  });

  // Remove Role Skill Requirement Mutation
  const removeRoleSkillMutation = useMutation({
    mutationFn: (skillId: string) => adminService.removeRoleSkill(managingRole!._id, skillId),
    onSuccess: () => {
      refetchRoleDetail();
      toast.success('Skill requirement removed.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove requirement.');
    },
  });

  const handleEditClick = (role: CareerRole) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('description', role.description);
    setValue('category', role.category);
    setValue('level', role.level || 'Entry');
  };

  const onAddSubmit = (formData: RoleFormData) => {
    createRoleMutation.mutate(formData);
  };

  const onEditSubmit = (formData: RoleFormData) => {
    if (!editingRole) return;
    updateRoleMutation.mutate({ roleId: editingRole._id, data: formData });
  };

  const roles = data?.roles || [];
  const pagination = data?.pagination;
  const roleSkillMappings = roleDetail?.skills || [];

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Briefcase className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            Career Role Catalog & Skill Requirements
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage target engineering roles and define required skills with proficiency benchmarks.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="h-4 w-4" />
          Add Career Role
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder="Search role name, description, category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
            </div>

            <Select
              options={[
                { label: 'All Categories', value: '' },
                { label: 'Software Development', value: 'Software Development' },
                { label: 'Data / AI', value: 'Data / AI' },
                { label: 'Cloud / DevOps', value: 'Cloud / DevOps' },
                { label: 'Security', value: 'Security' },
                { label: 'Database', value: 'Database' },
                { label: 'Testing', value: 'Testing' },
              ]}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Career Roles Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Target Career Roles ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500">
              <Briefcase className="h-8 w-8 text-zinc-400 mx-auto" />
              <p>No matching career roles found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pr-4">Role Title</th>
                    <th className="pb-3 px-4">Category & Level</th>
                    <th className="pb-3 px-4">Description</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {roles.map((r) => (
                    <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 pr-4 font-bold text-zinc-900 dark:text-zinc-100">
                        <div>{r.name}</div>
                        <span className="text-[10px] text-zinc-400 font-mono">{r.slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <Badge variant="purple" className="text-[10px] py-0 font-semibold">
                            {r.category}
                          </Badge>
                          <div className="text-[10px] text-zinc-400">Level: {r.level || 'Entry'}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {r.description}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={r.isActive ? 'success' : 'outline'} className="text-[10px] py-0 font-bold">
                          {r.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManagingRole(r)}
                            className="h-8 text-[11px] gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                            title="Manage Required Skills"
                          >
                            <Sliders className="h-3.5 w-3.5" />
                            Skills
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(r)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-purple-600"
                            title="Edit Role"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant={r.isActive ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(r._id)}
                            className={`h-8 text-xs ${
                              r.isActive ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                            title={r.isActive ? 'Deactivate role' : 'Activate role'}
                          >
                            <Power className="h-3.5 w-3.5 mr-1" />
                            {r.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Role Skills Modal */}
      <Dialog open={!!managingRole} onOpenChange={() => setManagingRole(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-purple-600" />
              Skill Requirements for {managingRole?.name}
            </DialogTitle>
            <DialogDescription>
              Define required skills, importance ratings, and minimum/recommended proficiency benchmarks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2 text-xs">
            {/* Add Skill Requirement Form */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Add Skill Requirement</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Select Skill"
                  options={[
                    { label: '-- Select Skill from Catalog --', value: '' },
                    ...catalogSkills.map((s) => ({ label: `${s.name} (${s.category})`, value: s._id })),
                  ]}
                  value={reqSkillId}
                  onChange={(e) => setReqSkillId(e.target.value)}
                />

                <Select
                  label="Importance Level"
                  options={[
                    { label: 'CRITICAL (Essential for Role)', value: 'CRITICAL' },
                    { label: 'HIGH (Strongly Recommended)', value: 'HIGH' },
                    { label: 'MEDIUM (Useful / Expected)', value: 'MEDIUM' },
                    { label: 'LOW (Optional Bonus)', value: 'LOW' },
                  ]}
                  value={reqImportance}
                  onChange={(e) => setReqImportance(e.target.value as any)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Min Proficiency ({reqMinProf}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={reqMinProf}
                    onChange={(e) => setReqMinProf(parseInt(e.target.value))}
                    className="w-full h-2 accent-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Rec Proficiency ({reqRecProf}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={reqRecProf}
                    onChange={(e) => setReqRecProf(parseInt(e.target.value))}
                    className="w-full h-2 accent-purple-600"
                  />
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={() => addRoleSkillMutation.mutate()}
                disabled={!reqSkillId || reqMinProf > reqRecProf}
                isLoading={addRoleSkillMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Save Skill Requirement
              </Button>
            </div>

            {/* Configured Skill Requirements List */}
            <div className="space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                Configured Skill Requirements ({roleSkillMappings.length})
              </span>

              {roleSkillMappings.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  No skill requirements mapped to this career role yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {roleSkillMappings.map((m) => {
                    const skill = (m.skillId as any) || {};
                    return (
                      <div
                        key={m._id}
                        className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{skill.name}</span>
                            <Badge
                              variant={m.importance === 'CRITICAL' ? 'warning' : m.importance === 'HIGH' ? 'purple' : 'secondary'}
                              className="text-[10px] py-0 font-bold"
                            >
                              {m.importance}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Min: <strong className="text-zinc-700 dark:text-zinc-300">{m.minimumProficiency}%</strong> • Rec: <strong className="text-purple-600 dark:text-purple-400">{m.recommendedProficiency}%</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeRoleSkillMutation.mutate(skill._id)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Remove requirement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingRole(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Career Role Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Target Career Role</DialogTitle>
            <DialogDescription>Create a new engineering career role entry.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-2">
            <Input label="Career Role Title" placeholder="e.g. Software Development Engineer" {...register('name')} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                options={[
                  { label: 'Software Development', value: 'Software Development' },
                  { label: 'Data / AI', value: 'Data / AI' },
                  { label: 'Cloud / DevOps', value: 'Cloud / DevOps' },
                  { label: 'Security', value: 'Security' },
                  { label: 'Database', value: 'Database' },
                  { label: 'Testing', value: 'Testing' },
                ]}
                {...register('category')}
              />

              <Select
                label="Level"
                options={[
                  { label: 'Entry', value: 'Entry' },
                  { label: 'Mid', value: 'Mid' },
                  { label: 'Senior', value: 'Senior' },
                ]}
                {...register('level')}
              />
            </div>

            <Input label="Description" placeholder="Brief summary of role responsibilities..." {...register('description')} error={errors.description?.message} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createRoleMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                Create Career Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Career Role Modal */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Career Role Entry</DialogTitle>
            <DialogDescription>Update role title, category, or description.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <Input label="Career Role Title" {...register('name')} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                options={[
                  { label: 'Software Development', value: 'Software Development' },
                  { label: 'Data / AI', value: 'Data / AI' },
                  { label: 'Cloud / DevOps', value: 'Cloud / DevOps' },
                  { label: 'Security', value: 'Security' },
                  { label: 'Database', value: 'Database' },
                  { label: 'Testing', value: 'Testing' },
                ]}
                {...register('category')}
              />

              <Select
                label="Level"
                options={[
                  { label: 'Entry', value: 'Entry' },
                  { label: 'Mid', value: 'Mid' },
                  { label: 'Senior', value: 'Senior' },
                ]}
                {...register('level')}
              />
            </div>

            <Input label="Description" {...register('description')} error={errors.description?.message} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateRoleMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
