'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Settings, ShieldCheck, Bell, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainerSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [followUpAlerts, setFollowUpAlerts] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);

  const handleSave = () => {
    toast.success('Trainer Portal preferences saved successfully.');
  };

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Settings className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Trainer Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trainer Portal Settings ⚙️
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Configure notifications, follow-up alert frequency, evidence verification policies, and security settings for the Trainer Workspace.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-6">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Notification & Alert Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Longitudinal Follow-up Reminders</span>
              <span className="text-slate-500 text-xs">Receive notifications when 30, 90, 180, or 365-day checkpoints are due.</span>
            </div>
            <input
              type="checkbox"
              checked={followUpAlerts}
              onChange={(e) => setFollowUpAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Outcome Verification Alerts</span>
              <span className="text-slate-500 text-xs">Alert when trainees upload evidence documents for outcome verification.</span>
            </div>
            <input
              type="checkbox"
              checked={verificationAlerts}
              onChange={(e) => setVerificationAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Email Reports & Digest</span>
              <span className="text-slate-500 text-xs">Receive weekly aggregated cohort employment & placement status reports.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
