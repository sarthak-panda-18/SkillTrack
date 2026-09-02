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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { NotificationPreferences } from '@/types/notification';

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

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Fetch real notification preferences
  const { data: prefData } = useQuery({
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
        <h1 className="font-condensed text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-foreground">ACCOUNT SETTINGS</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Manage your personal details, theme preferences, security, and notifications.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-surface-secondary border border-border p-1 rounded-sm">
          <TabsTrigger value="account" className="gap-2 text-xs font-mono font-bold uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black">
            <UserIcon className="h-3.5 w-3.5" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs font-mono font-bold uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black">
            <Sun className="h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs font-mono font-bold uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs font-mono font-bold uppercase data-[state=active]:bg-[#FFD400] data-[state=active]:text-black">
            <Lock className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2 text-xs font-mono font-bold uppercase text-rose-500 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
            <Trash2 className="h-3.5 w-3.5" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card className="bg-card border-border text-card-foreground rounded-sm">
            <CardHeader className="p-6 pb-4 border-b border-border mb-4">
              <CardTitle className="font-condensed text-xl font-extrabold uppercase text-foreground">PERSONAL INFORMATION</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-sans">View your registered student account information.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 font-sans">
              <Input label="Full Name" value={user?.name || ''} readOnly className="bg-surface border-border text-foreground" />
              <Input label="Email Address" value={user?.email || ''} readOnly className="bg-surface border-border text-foreground" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="College" value={user?.college || ''} readOnly className="bg-surface border-border text-foreground" />
                <Input label="Graduation Year" value={user?.graduationYear || ''} readOnly className="bg-surface border-border text-foreground" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="bg-card border-border text-card-foreground rounded-sm">
            <CardHeader className="p-6 pb-4 border-b border-border mb-4">
              <CardTitle className="font-condensed text-xl font-extrabold uppercase text-foreground">THEME PREFERENCE</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-sans">Choose how SkillTrack AI looks on your screen.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'light', label: 'Light Mode', icon: Sun },
                  { key: 'dark', label: 'Dark Mode (iQOO Black)', icon: Moon },
                  { key: 'system', label: 'System Default', icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTheme(item.key)}
                      className={`p-5 rounded-sm border flex flex-col items-center gap-3 transition-all font-mono text-xs uppercase cursor-pointer ${
                        isSelected
                          ? 'border-[#FFD400] bg-[#FFD400]/15 text-foreground font-bold shadow-md'
                          : 'border-border bg-surface-secondary hover:border-border-hover text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-[#FFD400]' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
            <CardHeader className="p-6 pb-4 border-b border-white/10 mb-4">
              <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white">NOTIFICATION PREFERENCES</CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-sans">Customize which email and in-app notifications you receive.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Email Notifications */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#FFD400]">
                  EMAIL NOTIFICATIONS
                </h3>
                {[
                  { key: 'emailLearningCompletion', title: 'Learning Milestone Emails', desc: 'Receive emails when you complete learning pathway topics.' },
                  { key: 'emailAssessmentResults', title: 'Assessment Result Emails', desc: 'Receive emails with score breakdowns after submitting skill assessments.' },
                  { key: 'emailGoalMilestones', title: 'Goal Achievement Emails', desc: 'Get notified via email when you achieve target milestones.' },
                  { key: 'emailSecurityNotifications', title: 'Security Alert Emails', desc: 'Receive security notifications when important account changes occur.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-sm border border-white/10 bg-[#111111]">
                    <div>
                      <h4 className="font-condensed font-bold text-base text-white uppercase">{item.title}</h4>
                      <p className="text-xs text-zinc-400 font-sans">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!(preferences as any)[item.key]}
                      onChange={(e) => {
                        const updated = { ...preferences, [item.key]: e.target.checked };
                        setPreferences(updated);
                        updatePrefMutation.mutate(updated);
                      }}
                      className="h-4 w-4 rounded-sm border-white/20 text-[#FFD400] accent-[#FFD400] cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              {/* In-App Notifications */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#FFD400]">
                  IN-APP HEADER ALERTS
                </h3>
                {[
                  { key: 'inAppLearning', title: 'Learning Alerts', desc: 'Show in-app bell notifications for learning milestones.' },
                  { key: 'inAppAssessments', title: 'Assessment Alerts', desc: 'Show in-app bell notifications for assessment completions.' },
                  { key: 'inAppGoals', title: 'Goal Milestone Alerts', desc: 'Show in-app bell notifications when goals are achieved.' },
                  { key: 'inAppAchievements', title: 'Achievement Alerts', desc: 'Show in-app bell notifications for platform achievements.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-sm border border-white/10 bg-[#111111]">
                    <div>
                      <h4 className="font-condensed font-bold text-base text-white uppercase">{item.title}</h4>
                      <p className="text-xs text-zinc-400 font-sans">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!(preferences as any)[item.key]}
                      onChange={(e) => {
                        const updated = { ...preferences, [item.key]: e.target.checked };
                        setPreferences(updated);
                        updatePrefMutation.mutate(updated);
                      }}
                      className="h-4 w-4 rounded-sm border-white/20 text-[#FFD400] accent-[#FFD400] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="bg-[#0A0A0A] border-white/10 text-white rounded-sm">
            <CardHeader className="p-6 pb-4 border-b border-white/10 mb-4">
              <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white">CHANGE PASSWORD</CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-sans">Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 font-sans">
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
                <Button type="submit" isLoading={isChangingPass} className="gap-2 bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase">
                  Update Password
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center font-mono">
                <div>
                  <h4 className="font-condensed font-bold text-base text-white uppercase">Sign out of session</h4>
                  <p className="text-xs text-zinc-400 font-sans">Log out from your current device.</p>
                </div>
                <Button variant="outline" onClick={logout} className="gap-2 text-xs font-mono font-bold uppercase border-white/20 text-white hover:border-[#FFD400]">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="bg-[#0A0A0A] border-rose-500/40 text-white rounded-sm">
            <CardHeader className="p-6 pb-4 border-b border-rose-500/20 mb-4">
              <CardTitle className="font-condensed text-xl font-extrabold uppercase text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                DELETE ACCOUNT
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 font-sans">
                Permanently remove your account and all associated skill tracking data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs font-sans">
              <p className="text-zinc-300">
                Once deleted, your account cannot be recovered. All user skills, onboarding responses, and profile records will be permanently erased.
              </p>
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)} className="gap-2 text-xs font-mono font-bold uppercase bg-rose-600 hover:bg-rose-700 text-white">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-[#0A0A0A] border-rose-500/40 text-white rounded-sm">
          <DialogHeader>
            <DialogTitle className="font-condensed text-xl font-extrabold uppercase text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              CONFIRM ACCOUNT DELETION
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-mono">
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 font-mono">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="text-xs uppercase border-white/20 text-white">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} isLoading={isDeleting} className="text-xs uppercase bg-rose-600 hover:bg-rose-700 text-white">
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

