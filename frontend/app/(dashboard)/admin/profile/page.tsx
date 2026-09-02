'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { User, ShieldCheck, Mail, Building2, Calendar, Award } from 'lucide-react';

export default function TrainerProfilePage() {
  const { user } = useAuth();

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex items-center gap-6">
        <div className="h-20 w-20 rounded-3xl bg-indigo-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-lg">
          {user?.name?.charAt(0) || 'T'}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.name || 'Trainer Account'}</h1>
            <Badge className="bg-indigo-600 text-white font-bold text-xs">{user?.role || 'TRAINER'}</Badge>
          </div>
          <p className="text-slate-300 text-xs">{user?.email}</p>
          <p className="text-slate-400 text-xs font-mono">SIH 2026 Skilling Trainer & Outcome Evaluator</p>
        </div>
      </div>

      {/* Profile Details */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Trainer Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-extrabold uppercase text-[10px]">Full Name</span>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{user?.name}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-extrabold uppercase text-[10px]">Email Address</span>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{user?.email}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-extrabold uppercase text-[10px]">Role / Privilege</span>
            <div className="font-bold text-sm text-indigo-600">{user?.role} Portal Authorization</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 font-extrabold uppercase text-[10px]">Institution / Department</span>
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{user?.college || 'National Skilling Directorate'}</div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
