'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Bell, CheckCircle2, ShieldCheck, Zap, Award } from 'lucide-react';

export default function StudentNotificationsPage() {
  const notifications = [
    { id: '1', title: 'Outcome Evidence Verified', desc: 'Trainer verified your Full-Time Software Engineer offer letter.', time: '2 hours ago', type: 'VERIFICATION' },
    { id: '2', title: 'New Opportunity Match: Java Engineer', desc: 'You have a 92% match score for Java Backend Developer at TechCorp.', time: '5 hours ago', type: 'MATCH' },
    { id: '3', title: 'Skill Gap Remedial Plan Updated', desc: 'Gemini AI generated a targeted learning step for Spring Boot.', time: '1 day ago', type: 'REMEDIAL' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Bell className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Trainee Notification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Notifications & Alerts 🔔
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time notifications for evidence verification, opportunity matches, and skill-gap recommendations.
          </p>
        </div>
      </div>

      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardContent className="p-0 space-y-3 text-xs">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">{n.title}</span>
                <p className="text-slate-500">{n.desc}</p>
                <span className="text-[10px] text-slate-400 font-mono block">{n.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
