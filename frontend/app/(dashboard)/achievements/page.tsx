'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Award, CheckCircle2, Sparkles, Briefcase, Brain, GraduationCap, TrendingUp, ShieldCheck } from 'lucide-react';

export default function AchievementsPage() {
  const achievements = [
    { title: 'Training Program Completed', desc: 'Completed full skilling curriculum with 100% attendance.', icon: GraduationCap, unlocked: true, date: '15 Jan 2026' },
    { title: 'Placement Ready Certified', desc: 'Cleared core technical assessments and career readiness evaluation.', icon: ShieldCheck, unlocked: true, date: '10 Feb 2026' },
    { title: 'First Employment Offer', desc: 'Received verified offer letter for Full-Time Software Engineer.', icon: Award, unlocked: true, date: '28 Feb 2026' },
    { title: 'Salary Growth Milestone', desc: 'Achieved +33.3% salary growth upon employment verification.', icon: TrendingUp, unlocked: true, date: '02 Mar 2026' },
    { title: 'Verified Outcome Badge', desc: 'Outcome & supporting evidence verified by trainer.', icon: CheckCircle2, unlocked: true, date: '02 Mar 2026' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Platform Event-Driven Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Career Achievements & Milestones 🏆
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Badges and career milestones unlocked automatically through verified skilling, assessment, and placement events.
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <Card key={i} className="p-6 border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{a.title}</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Unlocked</Badge>
                </div>
                <p className="text-slate-500 text-xs">{a.desc}</p>
                <span className="text-[10px] text-indigo-600 font-mono font-bold block">{a.date}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
}
