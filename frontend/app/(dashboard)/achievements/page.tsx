'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Award, CheckCircle2, Sparkles, GraduationCap, TrendingUp, ShieldCheck } from 'lucide-react';

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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>PLATFORM EVENT-DRIVEN MILESTONES</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            CAREER ACHIEVEMENTS & MILESTONES <span className="text-[#FFD400]">🏆</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans">
            Badges and career milestones unlocked automatically through verified skilling, assessment, and placement events.
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((a, i) => {
          const Icon = a.icon;
          return (
            <Card key={i} className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm hover:border-[#FFD400]/40 transition-all flex items-start gap-4">
              <div className="h-12 w-12 rounded-sm bg-[#FFD400] text-black flex items-center justify-center font-bold shrink-0">
                <Icon className="h-6 w-6 text-black" />
              </div>
              <div className="space-y-1 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-condensed font-bold text-[#FFD400] text-lg uppercase">{a.title}</span>
                  <Badge variant="default" className="bg-[#FFD400]/20 text-[#FFD400] border-[#FFD400] font-mono font-bold text-[10px] uppercase">Unlocked</Badge>
                </div>
                <p className="text-zinc-400 text-xs">{a.desc}</p>
                <span className="text-[10px] text-zinc-500 font-mono font-bold block uppercase">{a.date}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </PageWrapper>
  );
}

