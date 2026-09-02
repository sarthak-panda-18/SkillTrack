'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Bell } from 'lucide-react';

export default function StudentNotificationsPage() {
  const notifications = [
    { id: '1', title: 'Assessment Evaluated: Java & Spring Boot', desc: 'Scored 85% proficiency. Skill badges updated on profile.', time: '2 hours ago', type: 'ASSESSMENT' },
    { id: '2', title: 'Company Insight Published', desc: 'Trainer approved your peer contribution for TechCorp Backend Developer.', time: '5 hours ago', type: 'INSIGHT' },
    { id: '3', title: 'Skill Gap Remedial Plan Updated', desc: 'Gemini AI generated a targeted learning step for Spring Boot.', time: '1 day ago', type: 'REMEDIAL' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <Bell className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>TRAINEE NOTIFICATION CENTER</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            NOTIFICATIONS & ALERTS <span className="text-[#FFD400]">🔔</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans">
            Real-time notifications for assessment evaluations, company insights, and skill-gap recommendations.
          </p>
        </div>
      </div>

      <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
        <CardContent className="p-0 space-y-3 text-xs">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 rounded-sm bg-[#111111] border border-white/10 flex items-start justify-between gap-4 font-sans">
              <div className="space-y-1">
                <span className="font-condensed font-bold text-lg text-white block uppercase">{n.title}</span>
                <p className="text-zinc-400 text-xs">{n.desc}</p>
                <span className="text-[10px] text-[#FFD400] font-mono block uppercase">{n.time}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

