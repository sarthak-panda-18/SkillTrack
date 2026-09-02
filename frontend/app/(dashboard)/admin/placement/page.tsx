'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminService, TrainerStats } from '@/services/admin.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';
import {
  TrendingUp,
  Briefcase,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Users,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

const STAGES = [
  { id: 'TRAINING_COMPLETED', name: 'Training Completed', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 border-blue-200' },
  { id: 'PLACEMENT_READY', name: 'Placement Ready', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950 border-indigo-200' },
  { id: 'SEEKING_EMPLOYMENT', name: 'Seeking Employment', icon: Search, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-200' },
  { id: 'INTERVIEW_STAGE', name: 'Interview Stage', icon: Send, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950 border-purple-200' },
  { id: 'OFFER_RECEIVED', name: 'Offer Received', icon: Clock, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border-emerald-200' },
  { id: 'JOINING_PENDING', name: 'Joining Pending', icon: Briefcase, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950 border-teal-200' },
  { id: 'EMPLOYED', name: 'Employed', icon: TrendingUp, color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900 border-emerald-300' },
];

export default function TrainerPlacementPipelinePage() {
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');

  const { data: stats, isLoading } = useQuery<TrainerStats>({
    queryKey: ['trainerPlacementStats', cohortFilter, courseFilter],
    queryFn: () => adminService.getTrainerStats({ cohort: cohortFilter, course: courseFilter }),
  });

  const { data: traineesData } = useQuery({
    queryKey: ['placementTraineesList'],
    queryFn: () => adminService.getUsers({ limit: 100 }),
  });

  if (isLoading) {
    return (
      <PageWrapper className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  const pipeline = stats?.pipeline || [];
  const trainees = traineesData?.users || [];

  return (
    <PageWrapper className="space-y-8">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Structured Placement Pipeline & Stage Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Trainee Placement Pipeline 🚀
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
            Track how trainees progress step-by-step from training completion to verified employment. Identify bottlenecks and support trainees at every stage.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-5 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span>Filter Pipeline By:</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              <option value="ALL">All Cohorts</option>
              <option value="Batch 2026">Batch 2026</option>
              <option value="Batch 2025">Batch 2025</option>
            </select>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
            >
              <option value="ALL">All Programs</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="AI & Data Science">AI & Data Science</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Structured Pipeline Visual Stages Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const stageItem = pipeline.find((p) => p.stage.toLowerCase().includes(stage.name.toLowerCase())) || { count: 0 };
          const stageTrainees = trainees.filter((t) => (t.placementStage || 'SEEKING_EMPLOYMENT') === stage.id);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`p-4 border shadow-sm transition-all hover:shadow-md ${stage.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                    Stage {idx + 1}
                  </span>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-extrabold mb-1">
                  {stageItem.count || stageTrainees.length}
                </div>
                <div className="text-xs font-bold leading-tight mb-3">
                  {stage.name}
                </div>
                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] space-y-1 opacity-90">
                  <div className="flex justify-between">
                    <span>Active Trainees:</span>
                    <span className="font-bold">{stageTrainees.length}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stage Trainees Table */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Trainees In Placement Pipeline
          </CardTitle>
          <CardDescription className="text-xs">
            Individual trainee stage status and target roles.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-extrabold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Trainee</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">College / Provider</th>
                <th className="py-3 px-4">Placement Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {trainees.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.email}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {t.targetRole || 'Software Engineer'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {t.college || 'Engineering College'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="font-semibold text-[10px]">
                      {(t.placementStage || 'SEEKING_EMPLOYMENT').replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/users/${t._id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
