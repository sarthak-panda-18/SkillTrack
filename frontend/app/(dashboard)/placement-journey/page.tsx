'use client';

import { useQuery } from '@tanstack/react-query';
import { careerOutcomeService } from '@/services/careerOutcome.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Compass, CheckCircle2, Briefcase, FileText, Brain, Users, Award, Clock } from 'lucide-react';

export default function PlacementJourneyPage() {
  const { data: currentOutcome } = useQuery({
    queryKey: ['career-outcome'],
    queryFn: () => careerOutcomeService.getCurrentOutcome(),
  });

  const stages = [
    { id: 'TRAINING_COMPLETED', title: 'Training Completed', desc: 'Skilling modules finished', done: true },
    { id: 'PLACEMENT_READY', title: 'Placement Ready', desc: 'Career readiness verified', done: true },
    { id: 'SEEKING_EMPLOYMENT', title: 'Seeking Employment', desc: 'Actively applying for roles', done: true },
    { id: 'APPLICATION', title: 'Applications Submitted', desc: '18 Active Applications', done: true },
    { id: 'ASSESSMENT', title: 'Technical Assessment', desc: '8 Assessments Cleared', done: true },
    { id: 'INTERVIEW', title: 'Interview Stage', desc: '6 Interviews Scheduled/Completed', done: true },
    { id: 'OFFER_RECEIVED', title: 'Offer Received', desc: '2 Employment Offers', done: currentOutcome?.outcomeType === 'EMPLOYED' || currentOutcome?.verificationStatus === 'VERIFIED' },
    { id: 'JOINING_PENDING', title: 'Joining Pending', desc: 'Offer Accepted', done: currentOutcome?.outcomeType === 'EMPLOYED' },
    { id: 'EMPLOYED', title: 'Employed', desc: 'Full-Time Industry Role', done: currentOutcome?.outcomeType === 'EMPLOYED' },
  ];

  const counters = [
    { label: 'Applications', count: 18, icon: FileText, color: 'text-indigo-600' },
    { label: 'Assessments Cleared', count: 8, icon: Brain, color: 'text-blue-600' },
    { label: 'Interviews Completed', count: 6, icon: Users, color: 'text-purple-600' },
    { label: 'Offers Received', count: 2, icon: Award, color: 'text-emerald-600' },
    { label: 'Roles Joined', count: currentOutcome?.outcomeType === 'EMPLOYED' ? 1 : 0, icon: Briefcase, color: 'text-amber-600' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Compass className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Structured Placement Funnel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Placement Journey 🎯
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Track your stage-by-stage placement progression from training completion to final employment joining.
          </p>
        </div>
      </div>

      {/* Placement Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {counters.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Card key={idx} className="p-4 border-slate-200 dark:border-slate-800 text-center">
              <Icon className={`h-6 w-6 ${c.color} mx-auto mb-2`} />
              <span className="text-[11px] font-extrabold text-slate-500 uppercase block">{c.label}</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">{c.count}</span>
            </Card>
          );
        })}
      </div>

      {/* Stage Timeline */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="h-5 w-5 text-indigo-600" />
            Structured Placement Stage Progression
          </CardTitle>
          <CardDescription className="text-xs">
            Visual milestone timeline mapping your journey to career outcome verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="space-y-3">
            {stages.map((st, i) => (
              <div key={st.id} className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${st.done ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${st.done ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-600'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">{st.title}</span>
                    <span className="text-slate-500 text-xs">{st.desc}</span>
                  </div>
                </div>
                {st.done ? (
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">Completed</Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400">Pending</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
