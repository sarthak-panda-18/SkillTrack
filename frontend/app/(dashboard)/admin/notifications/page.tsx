'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Bell, Calendar, UserCheck, AlertTriangle, FileCheck, CheckCircle2 } from 'lucide-react';

export default function TrainerNotificationsPage() {
  const notificationsList = [
    { id: '1', title: '5 Trainees Have Follow-ups Due', desc: '30-day and 90-day longitudinal follow-up checkpoints require attention.', type: 'FOLLOW_UP', time: '10 mins ago', isRead: false },
    { id: '2', title: 'Student Updated Career Outcome', desc: 'Priya Sharma recorded a new Full-Time Software Engineer outcome at TechCorp.', type: 'OUTCOME_UPDATE', time: '1 hour ago', isRead: false },
    { id: '3', title: '12 Trainees Seeking Employment', desc: 'Remedial intervention recommended for Batch 2026 technical skill gaps.', type: 'REMEDIAL', time: '3 hours ago', isRead: true },
    { id: '4', title: 'Employer Verification Pending', desc: '3 evidence documents submitted and awaiting trainer verification.', type: 'VERIFICATION', time: 'Yesterday', isRead: true },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex justify-between items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Bell className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Trainer Notification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trainer Alerts & System Notifications 🔔
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time alerts for trainee follow-up checkpoints, career outcome submissions, verification requests, and remedial intervention triggers.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            Recent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {notificationsList.map((n) => (
            <div key={n.id} className={`p-4 rounded-2xl border ${n.isRead ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' : 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'} flex items-start justify-between gap-4 text-xs`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{n.title}</span>
                  {!n.isRead && <Badge className="bg-indigo-600 text-white font-bold text-[10px]">New</Badge>}
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{n.desc}</p>
                <span className="text-[10px] text-slate-400 font-mono block">{n.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
