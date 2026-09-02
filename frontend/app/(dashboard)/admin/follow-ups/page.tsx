'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building2,
  Briefcase,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';

export default function TrainerFollowUpsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [checkpointFilter, setCheckpointFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['trainerFollowUps', statusFilter, checkpointFilter, search],
    queryFn: () =>
      adminService.getTrainerFollowUps({
        status: statusFilter,
        checkpoint: checkpointFilter,
        search,
      }),
  });

  const triggerRemindersMutation = useMutation({
    mutationFn: () => adminService.triggerFollowUpReminders(),
    onSuccess: (res) => {
      alert(`Automated reminders dispatched! ${res.notifiedCount} trainees notified.`);
      queryClient.invalidateQueries({ queryKey: ['trainerFollowUps'] });
    },
  });

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </PageWrapper>
    );
  }

  const followUps = data?.followUps || [];
  const stats = data?.stats || { upcoming: 0, due: 0, completed: 0, overdue: 0, total: 0 };

  return (
    <PageWrapper className="space-y-8">
      {/* Page Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-indigo-950 text-white shadow-xl border border-indigo-900 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-900 text-indigo-200 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Longitudinal Outcome Checkpoints</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Automated & Assisted Follow-Ups 📅
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm">
            Track trainee career progression at 30-day, 90-day, 180-day, and 365-day post-training milestones. Verify employment continuity, salary growth, and training relevance.
          </p>
        </div>

        <Button
          onClick={() => triggerRemindersMutation.mutate()}
          disabled={triggerRemindersMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg flex items-center gap-2 shrink-0"
        >
          <Bell className="h-4 w-4" />
          <span>{triggerRemindersMutation.isPending ? 'Sending Notifications...' : 'Trigger Due Reminders'}</span>
        </Button>
      </div>

      {/* 4 Core Checkpoint Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          onClick={() => setStatusFilter('DUE')}
          className={`p-5 cursor-pointer transition-all border ${statusFilter === 'DUE' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-amber-600">Due Follow-Ups</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{stats.due}</div>
          <p className="text-xs text-slate-500 mt-1">Pending student survey submission</p>
        </Card>

        <Card
          onClick={() => setStatusFilter('OVERDUE')}
          className={`p-5 cursor-pointer transition-all border ${statusFilter === 'OVERDUE' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-rose-600">Overdue Checkpoints</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">{stats.overdue}</div>
          <p className="text-xs text-slate-500 mt-1">14+ days overdue action needed</p>
        </Card>

        <Card
          onClick={() => setStatusFilter('COMPLETED')}
          className={`p-5 cursor-pointer transition-all border ${statusFilter === 'COMPLETED' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-emerald-600">Completed Checkpoints</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.completed}</div>
          <p className="text-xs text-slate-500 mt-1">Outcome data collected</p>
        </Card>

        <Card
          onClick={() => setStatusFilter('UPCOMING')}
          className={`p-5 cursor-pointer transition-all border ${statusFilter === 'UPCOMING' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-indigo-600">Upcoming Milestones</span>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.upcoming}</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled future follow-ups</p>
        </Card>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-5 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by trainee name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="DUE">Due</option>
                <option value="OVERDUE">Overdue</option>
                <option value="COMPLETED">Completed</option>
                <option value="UPCOMING">Upcoming</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Checkpoint:</span>
              <select
                value={checkpointFilter}
                onChange={(e) => setCheckpointFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">All Checkpoints</option>
                <option value="30_DAY">30-Day Follow-Up</option>
                <option value="90_DAY">90-Day Follow-Up</option>
                <option value="180_DAY">180-Day Follow-Up</option>
                <option value="365_DAY">365-Day Follow-Up</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Follow-Ups Table */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Longitudinal Follow-Up Checkpoints Queue
          </CardTitle>
          <CardDescription className="text-xs">
            Assisted monitoring of trainee career progress across post-training checkpoints.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-extrabold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Checkpoint</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Outcome Response</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {followUps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No longitudinal follow-up records found matching filters.
                  </td>
                </tr>
              ) : (
                followUps.map((f: any) => {
                  const student = f.userId || {};
                  return (
                    <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{student.name || 'Student'}</div>
                        <div className="text-[11px] text-slate-500">{student.email}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {f.checkpoint.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(f.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            f.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : f.status === 'DUE'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : f.status === 'OVERDUE'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }
                        >
                          {f.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {f.status === 'COMPLETED' ? (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-emerald-600">{f.employmentStatus || 'EMPLOYED'}</span>
                            {f.currentSalary && <span className="text-[10px] text-slate-500 block">₹{(f.currentSalary / 100000).toFixed(1)} LPA</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending response</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users/${student._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Trainee Detail</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
