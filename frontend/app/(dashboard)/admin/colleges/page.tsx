'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Power,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
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
import { College } from '@/types/college';

const collegeSchema = z.object({
  name: z.string().min(2, 'College name is required'),
  shortName: z.string().optional(),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  university: z.string().optional(),
  type: z.enum(['IIT', 'NIT', 'IIIT', 'Government', 'State University', 'Private', 'Deemed', 'Autonomous', 'Engineering College']),
});

type CollegeFormData = z.infer<typeof collegeSchema>;

export default function AdminCollegesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>('catalog');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);

  // Fetch catalog colleges
  const { data, isLoading } = useQuery({
    queryKey: ['adminColleges', search, stateFilter, typeFilter, page],
    queryFn: () =>
      adminService.getAdminColleges({
        search,
        state: stateFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 15,
      }),
  });

  // Fetch student college requests
  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['adminCollegeRequests'],
    queryFn: () => adminService.getAdminCollegeRequests(),
    enabled: activeTab === 'requests',
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CollegeFormData>({
    resolver: zodResolver(collegeSchema),
    defaultValues: {
      type: 'Engineering College',
    },
  });

  // Create College Mutation
  const createCollegeMutation = useMutation({
    mutationFn: (formData: CollegeFormData) => adminService.createCollege(formData),
    onSuccess: (newCollege) => {
      queryClient.invalidateQueries({ queryKey: ['adminColleges'] });
      queryClient.invalidateQueries({ queryKey: ['collegesSearch'] });
      toast.success(`College "${newCollege.name}" added to catalog!`);
      setIsAddOpen(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create college');
    },
  });

  // Update College Mutation
  const updateCollegeMutation = useMutation({
    mutationFn: ({ collegeId, data }: { collegeId: string; data: Partial<College> }) =>
      adminService.updateCollege(collegeId, data),
    onSuccess: (updatedCollege) => {
      queryClient.invalidateQueries({ queryKey: ['adminColleges'] });
      queryClient.invalidateQueries({ queryKey: ['collegesSearch'] });
      toast.success(`College "${updatedCollege.name}" updated!`);
      setEditingCollege(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update college');
    },
  });

  // Toggle College Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (collegeId: string) => adminService.toggleCollegeStatus(collegeId),
    onSuccess: (updatedCollege) => {
      queryClient.invalidateQueries({ queryKey: ['adminColleges'] });
      queryClient.invalidateQueries({ queryKey: ['collegesSearch'] });
      toast.success(
        `College "${updatedCollege.name}" is now ${updatedCollege.isActive ? 'Active' : 'Inactive'}`
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update college status');
    },
  });

  // Review College Addition Request Mutation
  const reviewRequestMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: 'APPROVED' | 'REJECTED' }) =>
      adminService.reviewCollegeRequest(requestId, status),
    onSuccess: (reviewedReq) => {
      queryClient.invalidateQueries({ queryKey: ['adminCollegeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['adminColleges'] });
      queryClient.invalidateQueries({ queryKey: ['collegesSearch'] });
      toast.success(`Request for "${reviewedReq.collegeName}" ${reviewedReq.status.toLowerCase()}!`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to review request');
    },
  });

  const handleEditClick = (college: College) => {
    setEditingCollege(college);
    setValue('name', college.name);
    setValue('shortName', college.shortName || '');
    setValue('state', college.state);
    setValue('city', college.city);
    setValue('university', college.university || '');
    setValue('type', (college.type || 'Engineering College') as any);
  };

  const onAddSubmit = (formData: CollegeFormData) => {
    createCollegeMutation.mutate(formData);
  };

  const onEditSubmit = (formData: CollegeFormData) => {
    if (!editingCollege) return;
    updateCollegeMutation.mutate({ collegeId: editingCollege._id, data: formData });
  };

  const colleges = data?.colleges || [];
  const pagination = data?.pagination;
  const requests = requestsData?.requests || [];

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Engineering College Catalog & Requests
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage institutions across 28 States & 8 UTs and review student unlisted college requests.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add New College
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Official Catalog
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Clock className="h-4 w-4" />
          Student Addition Requests
          {requests.filter((r) => r.status === 'PENDING').length > 0 && (
            <Badge variant="purple" className="text-[10px] py-0 px-1.5 font-bold">
              {requests.filter((r) => r.status === 'PENDING').length}
            </Badge>
          )}
        </button>
      </div>

      {/* CATALOG TAB CONTENT */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search college name, shortName, city..."
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
                    { label: 'All States', value: '' },
                    { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
                    { label: 'Telangana', value: 'Telangana' },
                    { label: 'Tamil Nadu', value: 'Tamil Nadu' },
                    { label: 'Karnataka', value: 'Karnataka' },
                    { label: 'Maharashtra', value: 'Maharashtra' },
                    { label: 'Delhi', value: 'Delhi' },
                    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
                  ]}
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value);
                    setPage(1);
                  }}
                />

                <Select
                  options={[
                    { label: 'All Types', value: '' },
                    { label: 'IIT', value: 'IIT' },
                    { label: 'NIT', value: 'NIT' },
                    { label: 'IIIT', value: 'IIIT' },
                    { label: 'Autonomous', value: 'Autonomous' },
                    { label: 'Deemed', value: 'Deemed' },
                    { label: 'State University', value: 'State University' },
                    { label: 'Engineering College', value: 'Engineering College' },
                  ]}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* College Catalog Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catalog Entries ({pagination?.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3 py-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : colleges.length === 0 ? (
                <div className="text-center py-10 space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-500">
                  <Building2 className="h-8 w-8 text-zinc-400 mx-auto" />
                  <p>No matching colleges found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                        <th className="pb-3 pr-4">College Name</th>
                        <th className="pb-3 px-4">Location</th>
                        <th className="pb-3 px-4">Type & Affiliation</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {colleges.map((c) => (
                        <tr key={c._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3 pr-4 font-bold text-zinc-900 dark:text-zinc-100">
                            <div>{c.name}</div>
                            {c.shortName && <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">({c.shortName})</span>}
                          </td>
                          <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-zinc-400" />
                              <span>{c.city}, {c.state}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <Badge variant="secondary" className="text-[10px] py-0 font-semibold">
                                {c.type}
                              </Badge>
                              {c.university && <div className="text-[10px] text-zinc-400">{c.university}</div>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={c.isActive ? 'success' : 'outline'} className="text-[10px] py-0 font-bold">
                              {c.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(c)}
                                className="h-8 w-8 p-0 text-zinc-500 hover:text-indigo-600"
                                title="Edit College"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={c.isActive ? 'outline' : 'secondary'}
                                size="sm"
                                onClick={() => toggleStatusMutation.mutate(c._id)}
                                className={`h-8 text-xs ${
                                  c.isActive ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50' : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                                title={c.isActive ? 'Deactivate college' : 'Activate college'}
                              >
                                <Power className="h-3.5 w-3.5 mr-1" />
                                {c.isActive ? 'Deactivate' : 'Activate'}
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
        </div>
      )}

      {/* STUDENT REQUESTS TAB CONTENT */}
      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending & Reviewed Student College Addition Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                No student college addition requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                      <th className="pb-3 pr-4">Requested College Name</th>
                      <th className="pb-3 px-4">Location</th>
                      <th className="pb-3 px-4">Requested By</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {requests.map((r) => (
                      <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-3 pr-4 font-bold text-zinc-900 dark:text-zinc-100">{r.collegeName}</td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{r.city}, {r.state}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{r.studentName}</div>
                          <div className="text-[10px] text-zinc-400">{r.studentEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'outline' : 'purple'}
                            className="text-[10px] py-0 font-bold"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {r.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => reviewRequestMutation.mutate({ requestId: r._id, status: 'APPROVED' })}
                                className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reviewRequestMutation.mutate({ requestId: r._id, status: 'REJECTED' })}
                                className="h-7 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add College Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Engineering College</DialogTitle>
            <DialogDescription>Add a new institution to the platform database.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-2">
            <Input label="College Full Name" placeholder="e.g. Prasad V. Potluri Siddhartha Institute of Technology" {...register('name')} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Short Name / Acronym" placeholder="PVPSIT" {...register('shortName')} />
              <Select
                label="Institution Type"
                options={[
                  { label: 'Autonomous', value: 'Autonomous' },
                  { label: 'State University', value: 'State University' },
                  { label: 'IIT', value: 'IIT' },
                  { label: 'NIT', value: 'NIT' },
                  { label: 'IIIT', value: 'IIIT' },
                  { label: 'Deemed', value: 'Deemed' },
                  { label: 'Government', value: 'Government' },
                  { label: 'Private', value: 'Private' },
                  { label: 'Engineering College', value: 'Engineering College' },
                ]}
                {...register('type')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="City" placeholder="Vijayawada" {...register('city')} error={errors.city?.message} />
              <Input label="State" placeholder="Andhra Pradesh" {...register('state')} error={errors.state?.message} />
            </div>

            <Input label="Affiliated University (Optional)" placeholder="JNTUK" {...register('university')} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={createCollegeMutation.isPending}>
                Create College Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit College Modal */}
      <Dialog open={!!editingCollege} onOpenChange={() => setEditingCollege(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit College Entry</DialogTitle>
            <DialogDescription>Update institution name or location details.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 py-2">
            <Input label="College Full Name" {...register('name')} error={errors.name?.message} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Short Name" {...register('shortName')} />
              <Select
                label="Institution Type"
                options={[
                  { label: 'Autonomous', value: 'Autonomous' },
                  { label: 'State University', value: 'State University' },
                  { label: 'IIT', value: 'IIT' },
                  { label: 'NIT', value: 'NIT' },
                  { label: 'IIIT', value: 'IIIT' },
                  { label: 'Deemed', value: 'Deemed' },
                  { label: 'Government', value: 'Government' },
                  { label: 'Private', value: 'Private' },
                  { label: 'Engineering College', value: 'Engineering College' },
                ]}
                {...register('type')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="City" {...register('city')} error={errors.city?.message} />
              <Input label="State" {...register('state')} error={errors.state?.message} />
            </div>

            <Input label="Affiliated University" {...register('university')} />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingCollege(null)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={updateCollegeMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
