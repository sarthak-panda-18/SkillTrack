'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Sun,
  Moon,
  Laptop,
  Bell,
  Lock,
  Trash2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { userService } from '@/services/user.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { NotificationPreferences } from '@/types/notification';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Fetch real notification preferences
  const { data: prefData, isLoading: isLoadingPref } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  const [preferences, setPreferences] = useState<Partial<NotificationPreferences>>({
    emailLearningCompletion: true,
    emailAssessmentResults: true,
    emailGoalMilestones: true,
    emailSecurityNotifications: true,
    inAppLearning: true,
    inAppAssessments: true,
    inAppGoals: true,
    inAppAchievements: true,
  });

  // Sync state when query loads
  useEffect(() => {
    if (prefData) {
      setPreferences(prefData);
    }
  }, [prefData]);

  const updatePrefMutation = useMutation({
    mutationFn: (updated: Partial<NotificationPreferences>) => notificationService.updatePreferences(updated),
    onSuccess: (saved) => {
      setPreferences(saved);
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save notification preferences');
    },
  });

  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    formState: { errors: passErrors },
    reset: resetPass,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePasswordSubmit = async (data: ChangePasswordFormData) => {
    setIsChangingPass(true);
    try {
      await userService.changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPass();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount();
      toast.success('Account deleted successfully');
      window.location.href = '/register';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <PageWrapper className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Account Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Manage your personal details, theme preferences, security, and notifications.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="account" className="gap-2 text-xs">
            <UserIcon className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs">
            <Sun className="h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs">
            <Lock className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-xs text-rose-600 dark:text-rose-400">
            <Trash2 className="h-3.5 w-3.5" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>View your registered student account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Full Name" value={user?.name || ''} readOnly className="bg-zinc-100 dark:bg-zinc-800/50" />
              <Input label="Email Address" value={user?.email || ''} readOnly className="bg-zinc-100 dark:bg-zinc-800/50" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="College" value={user?.college || ''} readOnly className="bg-zinc-100 dark:bg-zinc-800/50" />
                <Input label="Graduation Year" value={user?.graduationYear || ''} readOnly className="bg-zinc-100 dark:bg-zinc-800/50" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme Preference</CardTitle>
              <CardDescription>Choose how SkillTrack AI looks on your screen.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'light', label: 'Light Mode', icon: Sun },
                  { key: 'dark', label: 'Dark Mode', icon: Moon },
                  { key: 'system', label: 'System Default', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTheme(item.key)}
                      className={`p-5 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Customize which email and in-app notifications you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Email Notifications
                </h3>
                {[
                  { key: 'emailLearningCompletion', title: 'Learning Milestone Emails', desc: 'Receive emails when you complete learning pathway topics.' },
                  { key: 'emailAssessmentResults', title: 'Assessment Result Emails', desc: 'Receive emails with score breakdowns after submitting skill assessments.' },
                  { key: 'emailGoalMilestones', title: 'Goal Achievement Emails', desc: 'Get notified via email when you achieve target milestones.' },
                  { key: 'emailSecurityNotifications', title: 'Security Alert Emails', desc: 'Receive security notifications when important account changes occur.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!(preferences as any)[item.key]}
                      onChange={(e) => {
                        const updated = { ...preferences, [item.key]: e.target.checked };
                        setPreferences(updated);
                        updatePrefMutation.mutate(updated);
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* In-App Notifications */}
              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  In-App Header Alerts
                </h3>
                {[
                  { key: 'inAppLearning', title: 'Learning Alerts', desc: 'Show in-app bell notifications for learning milestones.' },
                  { key: 'inAppAssessments', title: 'Assessment Alerts', desc: 'Show in-app bell notifications for assessment completions.' },
                  { key: 'inAppGoals', title: 'Goal Milestone Alerts', desc: 'Show in-app bell notifications when goals are achieved.' },
                  { key: 'inAppAchievements', title: 'Achievement Alerts', desc: 'Show in-app bell notifications for platform achievements.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                      <p className="text-[11px] text-zinc-500">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!(preferences as any)[item.key]}
                      onChange={(e) => {
                        const updated = { ...preferences, [item.key]: e.target.checked };
                        setPreferences(updated);
                        updatePrefMutation.mutate(updated);
                      }}
                      className="h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPass(onChangePasswordSubmit)} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  {...registerPass('currentPassword')}
                  error={passErrors.currentPassword?.message}
                />
                <Input
                  label="New Password"
                  type="password"
                  {...registerPass('newPassword')}
                  error={passErrors.newPassword?.message}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  {...registerPass('confirmPassword')}
                  error={passErrors.confirmPassword?.message}
                />
                <Button type="submit" isLoading={isChangingPass} className="gap-2">
                  Update Password
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Sign out of session</h4>
                  <p className="text-[11px] text-zinc-500">Log out from your current device.</p>
                </div>
                <Button variant="outline" onClick={logout} className="gap-2 text-xs">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-rose-200 dark:border-rose-950/80">
            <CardHeader>
              <CardTitle className="text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently remove your account and all associated skill tracking data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
              <p>
                Once deleted, your account cannot be recovered. All user skills, onboarding responses, and profile records will be permanently erased.
              </p>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} isLoading={isDeleting}>
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
