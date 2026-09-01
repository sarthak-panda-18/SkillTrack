'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Sliders,
  Plus,
  Search,
  Edit,
  Power,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
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
import { Skill } from '@/types/skill';

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

type SkillFormData = z.infer<typeof skillSchema>;

export default function AdminSkillsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['adminSkills'],
    queryFn: () => adminService.getAdminSkills(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
  });

  // Create Skill Mutation
  const createSkillMutation = useMutation({
    mutationFn: (data: SkillFormData) => adminService.createSkill(data),
    onSuccess: (newSkill) => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      queryClient.invalidateQueries({ queryKey: ['catalogSkills'] });
      toast.success(`Skill "${newSkill.name}" added to catalog!`);
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    },
  });

  // Update Skill Mutation
  const updateSkillMutation = useMutation({
    mutationFn: ({ skillId, data }: { skillId: string; data: Partial<Skill> }) =>
      adminService.updateSkill(skillId, data),
    onSuccess: (updatedSkill) => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      queryClient.invalidateQueries({ queryKey: ['catalogSkills'] });
      toast.success(`Skill "${updatedSkill.name}" updated successfully!`);
      setEditingSkill(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update skill');
    },
  });

  // Toggle Activation Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (skillId: string) => adminService.toggleSkillStatus(skillId),
    onSuccess: (updatedSkill) => {
      queryClient.invalidateQueries({ queryKey: ['adminSkills'] });
      queryClient.invalidateQueries({ queryKey: ['catalogSkills'] });
      toast.success(
        `Skill "${updatedSkill.name}" is now ${updatedSkill.isActive ? 'Active' : 'Deactivated'}`
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change skill status');
    },
  });

  const handleEditClick = (skill: Skill) => {
    setEditingSkill(skill);
    setValue('name', skill.name);
    setValue('category', skill.category);
    setValue('description', skill.description || '');
  };

  const onAddSubmit = (data: SkillFormData) => {
    createSkillMutation.mutate(data);
  };

  const onEditSubmit = (data: SkillFormData) => {
    if (!editingSkill) return;
    updateSkillMutation.mutate({ skillId: editingSkill._id, data });
  };

  // Filter skills by search and category
  const filteredSkills = skills.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? s.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(skills.map((s) => s.category)));

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Sliders className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Skill Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Add, update, activate or deactivate technical skills in the engineering catalog.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add New Skill
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder="Search skills by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-zinc-400 absolute left-3 top-3" />
            </div>

            <Select
              options={[
                { label: 'All Categories', value: '' },
                ...categories.map((c) => ({ label: c, value: c })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admin Skills Table / Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Skill Catalog Entries ({filteredSkills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500">
              <Code className="h-8 w-8 text-zinc-400 mx-auto" />
              <p>No matching skills found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 pr-4">Skill Name</th>
                    <th className="pb-3 px-4">Category</th>
                    <th className="pb-3 px-4">Description</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredSkills.map((s) => (
                    <tr key={s._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 pr-4 font-bold text-zinc-900 dark:text-zinc-100">{s.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="text-[10px] py-0 font-semibold">
                          {s.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 max-w-[250px] truncate">{s.description || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.isActive ? 'success' : 'outline'} className="text-[10px] py-0 font-bold">
                          {s.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(s)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600"
                            title="Edit Skill"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={s.isActive ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(s._id)}
                            className={`h-8 text-xs ${
                              s.isActive ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                            title={s.isActive ? 'Deactivate skill' : 'Activate skill'}
                          >
                            <Power className="h-3.5 w-3.5 mr-1" />
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Skill Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Technical Skill</DialogTitle>
            <DialogDescription>Create a new skill entry for student catalog selection.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-2">
            <Input label="Skill Name" placeholder="e.g. Kubernetes" {...register('name')} error={errors.name?.message} />

            <Select
              label="Skill Category"
              options={[
                { label: 'Programming', value: 'Programming' },
                { label: 'Web Development', value: 'Web Development' },
                { label: 'Databases', value: 'Databases' },
                { label: 'Computer Science', value: 'Computer Science' },
                { label: 'AI / Data', value: 'AI / Data' },
                { label: 'Tools', value: 'Tools' },
                { label: 'Cloud', value: 'Cloud' },
              ]}
              {...register('category')}
              error={errors.category?.message}
            />

            <Input label="Description (Optional)" placeholder="Short description of the skill" {...register('description')} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createSkillMutation.isPending}>
                Create Skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Modal */}
      <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill Entry</DialogTitle>
            <DialogDescription>Update skill name, category, or description.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <Input label="Skill Name" {...register('name')} error={errors.name?.message} />

            <Select
              label="Skill Category"
              options={[
                { label: 'Programming', value: 'Programming' },
                { label: 'Web Development', value: 'Web Development' },
                { label: 'Databases', value: 'Databases' },
                { label: 'Computer Science', value: 'Computer Science' },
                { label: 'AI / Data', value: 'AI / Data' },
                { label: 'Tools', value: 'Tools' },
                { label: 'Cloud', value: 'Cloud' },
              ]}
              {...register('category')}
              error={errors.category?.message}
            />

            <Input label="Description" {...register('description')} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingSkill(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateSkillMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
