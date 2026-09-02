'use client';

import { CareerStatusType } from '@/services/careerStatus.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  Search,
  AlertTriangle,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
} from 'lucide-react';

interface CareerStatusSelectorProps {
  currentStatus: CareerStatusType;
  onStatusChange: (status: CareerStatusType) => void;
  isSaving?: boolean;
}

export function CareerStatusSelector({
  currentStatus,
  onStatusChange,
  isSaving,
}: CareerStatusSelectorProps) {
  const statuses: Array<{
    id: CareerStatusType;
    label: string;
    description: string;
    icon: any;
  }> = [
    {
      id: 'EMPLOYED',
      label: 'Employed',
      description: 'Full-time, part-time or contract employment in industry.',
      icon: Briefcase,
    },
    {
      id: 'SEEKING_EMPLOYMENT',
      label: 'Seeking Employment',
      description: 'Actively preparing and applying for target job roles.',
      icon: Search,
    },
    {
      id: 'UNEMPLOYED',
      label: 'Unemployed',
      description: 'Currently not employed and identifying skill gaps.',
      icon: AlertTriangle,
    },
    {
      id: 'SELF_EMPLOYED',
      label: 'Self-Employed',
      description: 'Freelancing, startup founder, or independent business owner.',
      icon: Building,
    },
    {
      id: 'APPRENTICESHIP',
      label: 'Apprenticeship',
      description: 'Structured vocational training or internship program.',
      icon: Award,
    },
    {
      id: 'HIGHER_STUDIES',
      label: 'Higher Studies',
      description: 'Enrolled in post-graduate degree or specialized courses.',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-condensed font-extrabold text-xl uppercase tracking-wider text-white flex items-center gap-2">
            CURRENT CAREER STATUS
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Select your current status to unlock relevant career tools and forms.
          </p>
        </div>
        {isSaving && (
          <Badge variant="secondary" className="animate-pulse text-xs font-mono font-bold uppercase text-[#FFD400] bg-[#FFD400]/10 border border-[#FFD400]/40">
            Updating Status...
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map((item) => {
          const Icon = item.icon;
          const isSelected = currentStatus === item.id;
          return (
            <Card
              key={item.id}
              onClick={() => onStatusChange(item.id)}
              className={`p-4 cursor-pointer transition-all border rounded-sm relative overflow-hidden ${
                isSelected
                  ? 'border-[#FFD400] bg-[#FFD400]/10 shadow-lg'
                  : 'border-white/10 hover:border-[#FFD400]/40 bg-[#0A0A0A]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-sm font-bold ${
                      isSelected
                        ? 'bg-[#FFD400] text-black'
                        : 'bg-[#171717] text-zinc-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-condensed font-extrabold text-base uppercase text-white tracking-wide">
                      {item.label}
                    </h3>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-[#FFD400] shrink-0" />}
              </div>
              <p className="text-xs text-zinc-400 mt-2 line-clamp-2 font-sans">{item.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

