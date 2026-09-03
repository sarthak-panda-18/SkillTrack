'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, ArrowRight, GraduationCap, Target, Send, Users, FileCheck, UserCheck, Briefcase } from 'lucide-react';

interface PlacementJourneySectionProps {
  placementJourney: any;
}

export function PlacementJourneySection({ placementJourney }: PlacementJourneySectionProps) {
  const steps = [
    { key: 'trainingCompleted', title: 'Training Completed', icon: GraduationCap, done: placementJourney?.trainingCompleted ?? true },
    { key: 'placementReady', title: 'Placement Ready', icon: Target, done: placementJourney?.placementReady ?? true },
    { key: 'applied', title: 'Applied', icon: Send, done: placementJourney?.applied ?? true },
    { key: 'interview', title: 'Interview', icon: Users, done: placementJourney?.interview ?? true },
    { key: 'offerReceived', title: 'Offer Received', icon: FileCheck, done: placementJourney?.offerReceived ?? true },
    { key: 'joined', title: 'Joined', icon: UserCheck, done: placementJourney?.joined ?? true },
    { key: 'employed', title: 'Employed', icon: Briefcase, done: placementJourney?.employed ?? true },
  ];

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-b border-border mb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#FFD400]" />
          2. PLACEMENT JOURNEY
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground font-sans">
          Visual progression timeline from vocational training completion to full-time employment.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[700px] justify-between gap-2 p-4 rounded-sm bg-surface-secondary border border-border">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center text-center space-y-1.5 flex-1">
                    <div
                      className={`p-3 rounded-sm font-bold flex items-center justify-center ${
                        step.done
                          ? 'bg-[#FFD400] text-black shadow-lg'
                          : 'bg-surface text-muted-foreground border border-border'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-xs uppercase tracking-wider text-card-foreground block">
                      {step.title}
                    </span>
                    <Badge variant={step.done ? 'default' : 'secondary'} className={`text-[9px] font-mono font-bold uppercase ${step.done ? 'bg-[#FFD400]/10 text-[#FFD400] border-[#FFD400]/40' : 'bg-surface text-muted-foreground'}`}>
                      {step.done ? 'COMPLETED' : 'PENDING'}
                    </Badge>
                  </div>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

