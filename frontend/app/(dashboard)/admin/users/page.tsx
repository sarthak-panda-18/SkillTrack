'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  KeyRound,
  Mail,
  CheckSquare,
  Square,
  RefreshCw,
  Target,
  Brain,
  Award,
  BookOpen,
  Calendar,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { AdminEmailModal, AdminEmailRecipient } from '@/components/admin/AdminEmailModal';
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
import { User } from '@/types/user';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Selection state for bulk email
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<AdminEmailRecipient[]>([]);

  // User detail modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Suspend/Activate modal state
  const [targetUser, setTargetUser] = useState<User | null>(null);

  // Remove student modal state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, roleFilter, statusFilter, page],
    queryFn: () =>
      adminService.getUsers({
        search,
        role: (roleFilter || undefined) as any,
        status: (statusFilter || undefined) as any,
        page,
        limit: 15,
      }),
  });

  const { data: userDetailData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['adminUserDetail', selectedUserId],
    queryFn: () => adminService.getUserById(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success(
        `Student account for ${updatedUser.name} is now ${updatedUser.status === 'SUSPENDED' ? 'Suspended' : 'Activated'}`
      );
      setTargetUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
      toast.success(res.message || 'Student account permanently removed.');
      if (selectedUserId === deletingUser?._id) {
        setSelectedUserId(null);
      }
      setDeletingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove student account');
    },
  });

  const forcePasswordResetMutation = useMutation({
    mutationFn: (userId: string) => adminService.forcePasswordReset(userId),
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset email sent to student.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to initiate password reset');
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  // Toggle selection for a single student
  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Select All visible student rows
  const visibleStudentIds = users.filter((u) => u.role !== 'ADMIN').map((u) => u._id);
  const isAllSelected =
    visibleStudentIds.length > 0 && visibleStudentIds.every((id) => selectedUserIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(visibleStudentIds);
    }
  };

  // Handle opening email modal for single student
  const openSingleEmailModal = (user: { _id: string; name: string; email: string }) => {
    setEmailRecipients([{ _id: user._id, name: user.name, email: user.email }]);
    setIsEmailModalOpen(true);
  };

  // Handle opening email modal for bulk selection
  const openBulkEmailModal = () => {
    const selectedRecipients = users
      .filter((u) => selectedUserIds.includes(u._id))
      .map((u) => ({ _id: u._id, name: u.name, email: u.email }));

    if (selectedRecipients.length === 0) {
      toast.error('Please select at least one student recipient.');
      return;
    }

    setEmailRecipients(selectedRecipients);
    setIsEmailModalOpen(true);
  };

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Search, inspect full student profiles, manage status, reset passwords, and safely remove student accounts.
          </p>
        </div>

        {/* Action button for bulk email */}
        {selectedUserIds.length > 0 && (
          <Button
            onClick={openBulkEmailModal}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Mail className="h-4 w-4" />
            Contact Selected ({selectedUserIds.length})
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                placeholder="Search by name, email, college..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <Select
              options={[
                { label: 'All Roles', value: '' },
                { label: 'STUDENT', value: 'STUDENT' },
                { label: 'ADMIN', value: 'ADMIN' },
              ]}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            />

            <Select
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'ACTIVE', value: 'ACTIVE' },
                { label: 'SUSPENDED', value: 'SUSPENDED' },
              ]}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Registered Users ({pagination?.total || 0})</CardTitle>

          {visibleStudentIds.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              {isAllSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4 text-slate-400" />}
              {isAllSelected ? 'Deselect All' : 'Select All Students'}
            </button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500">
              <Users className="h-8 w-8 text-slate-400 mx-auto" />
              <p>No matching users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">College & Branch</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => {
                    const isSelected = selectedUserIds.includes(u._id);
                    return (
                      <tr
                        key={u._id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="py-3 w-10 text-center">
                          {u.role !== 'ADMIN' && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectUser(u._id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                          <div className="text-slate-500 text-[11px]">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px] py-0 font-bold">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          <div>{u.college || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400">{u.branch}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px] py-0 font-bold">
                            {u.status}
                          </Badge>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Contact Student Action Button */}
                            {u.role !== 'ADMIN' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openSingleEmailModal(u)}
                                className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                title="Contact Student via Email"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserId(u._id)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                              title="View User Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {u.role !== 'ADMIN' && (
                              <>
                                <Button
                                  variant={u.status === 'ACTIVE' ? 'outline' : 'secondary'}
                                  size="sm"
                                  onClick={() => setTargetUser(u)}
                                  className={`h-8 text-xs ${
                                    u.status === 'ACTIVE'
                                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50'
                                      : 'text-emerald-600 dark:text-emerald-400'
                                  }`}
                                  title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                                >
                                  {u.status === 'ACTIVE' ? <UserX className="h-3.5 w-3.5 mr-1" /> : <UserCheck className="h-3.5 w-3.5 mr-1" />}
                                  {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDeletingUser(u)}
                                  className="h-8 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
                                  title="Permanently Remove Student"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Student Profile View Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Complete Student Administrative Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Comprehensive student academic record, skill proficiencies, evaluations, goals, and management actions.
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Loading complete student record...</span>
            </div>
          ) : userDetailData ? (
            <div className="space-y-6 py-2 text-xs">
              {/* Identity Banner */}
              <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-slate-800">
                <div className="space-y-1">
                  <div className="font-bold text-base text-white">{userDetailData.user.name}</div>
                  <div className="text-slate-300 font-mono">{userDetailData.user.email}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="default" className="text-[10px] py-0 font-bold">
                      {userDetailData.user.role}
                    </Badge>
                    <Badge variant={userDetailData.user.status === 'ACTIVE' ? 'success' : 'warning'} className="text-[10px] py-0 font-bold">
                      {userDetailData.user.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {userDetailData.user.role !== 'ADMIN' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => openSingleEmailModal(userDetailData.user)}
                        className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={forcePasswordResetMutation.isPending}
                        onClick={() => forcePasswordResetMutation.mutate(userDetailData.user._id)}
                        className="gap-1.5 text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                        title="Dispatch password reset email to student"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                        Force Reset Password
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Academic & Career Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">College</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{userDetailData.user.college || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Degree & Branch</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{userDetailData.user.degree} in {userDetailData.user.branch}</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Target Role</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{userDetailData.user.targetRole || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Graduation Year</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{userDetailData.user.graduationYear || 'N/A'}</div>
                </div>
              </div>

              {/* Skills & Evaluated Competencies */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Verified Profile Skills ({userDetailData.skills?.length || 0})
                </div>
                {!userDetailData.skills || userDetailData.skills.length === 0 ? (
                  <div className="p-3 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No skills added to student profile yet.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userDetailData.skills.map((s) => (
                      <span key={s._id} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5">
                        <span>{(s.skillId as any)?.name || 'Skill'}</span>
                        <Badge variant={s.proficiency >= 70 ? 'success' : s.proficiency >= 40 ? 'default' : 'warning'} className="py-0 px-1.5 text-[9px]">
                          {s.proficiency}%
                        </Badge>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Assessment Evaluation History */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  20-Question Assessment Evaluation History ({userDetailData.assessmentAttempts?.length || 0})
                </div>
                {!userDetailData.assessmentAttempts || userDetailData.assessmentAttempts.length === 0 ? (
                  <div className="p-3 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No completed assessments recorded.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {userDetailData.assessmentAttempts.map((attempt: any) => (
                      <div key={attempt._id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{attempt.assessmentTitle || 'Skill Evaluation'}</span>
                          <div className="text-[10px] text-slate-500">
                            Score: {attempt.correctAnswers} / {attempt.totalQuestions || 20} ({attempt.percentage}%) • {new Date(attempt.submittedAt || attempt.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge variant={attempt.percentage >= 70 ? 'success' : 'warning'} className="text-[10px]">
                          {attempt.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Goals & Milestones */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Career Goals ({userDetailData.goals?.length || 0})
                </div>
                {!userDetailData.goals || userDetailData.goals.length === 0 ? (
                  <div className="p-3 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    No active goals set by student.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {userDetailData.goals.map((g: any) => (
                      <div key={g._id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{g.title}</span>
                          <div className="text-[10px] text-slate-500">{g.category} • Progress: {g.progress || 0}%</div>
                        </div>
                        <Badge variant={g.status === 'COMPLETED' ? 'success' : 'default'} className="text-[10px]">
                          {g.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-4 flex justify-between items-center">
            {userDetailData?.user && userDetailData.user.role !== 'ADMIN' && (
              <Button
                variant="outline"
                onClick={() => {
                  const u = userDetailData.user;
                  setSelectedUserId(null);
                  setDeletingUser(u);
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Remove Student
              </Button>
            )}

            <Button variant="outline" onClick={() => setSelectedUserId(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend / Activate Account Confirmation Dialog */}
      <Dialog open={!!targetUser} onOpenChange={() => setTargetUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={targetUser?.status === 'ACTIVE' ? 'text-amber-600' : 'text-emerald-600'}>
              {targetUser?.status === 'ACTIVE' ? 'Suspend Student Account' : 'Activate Student Account'}
            </DialogTitle>
            <DialogDescription>
              {targetUser?.status === 'ACTIVE'
                ? `Are you sure you want to suspend ${targetUser?.name}? They will no longer be able to log in to SkillTrack AI.`
                : `Are you sure you want to activate ${targetUser?.name}? They will regain full access to their student workspace.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setTargetUser(null)}>
              Cancel
            </Button>
            <Button
              variant={targetUser?.status === 'ACTIVE' ? 'default' : 'default'}
              isLoading={toggleStatusMutation.isPending}
              onClick={() =>
                toggleStatusMutation.mutate({
                  userId: targetUser!._id,
                  status: targetUser?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                })
              }
              className={targetUser?.status === 'ACTIVE' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
            >
              {targetUser?.status === 'ACTIVE' ? 'Confirm Suspension' : 'Confirm Activation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Remove Student Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Permanently Remove Student Account
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2 text-xs">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Student: {deletingUser?.name} ({deletingUser?.email})
              </p>
              <p className="text-rose-600 dark:text-rose-400 font-semibold">
                ⚠️ WARNING: This action is permanent and cannot be undone.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Removing this student will delete their user record, active goals, skill evaluation history, assessment attempts, study plans, and notifications.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={deleteUserMutation.isPending}
              onClick={() => deleteUserMutation.mutate(deletingUser!._id)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Permanently Remove Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Email Composer Modal */}
      <AdminEmailModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        recipients={emailRecipients}
        onSuccess={() => setSelectedUserIds([])}
      />
    </PageWrapper>
  );
}
