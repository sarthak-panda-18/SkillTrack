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
    color: string;
    badgeVariant: 'success' | 'warning' | 'purple' | 'default' | 'secondary';
  }> = [
    {
      id: 'EMPLOYED',
      label: 'Employed',
      description: 'Full-time, part-time or contract employment in industry.',
      icon: Briefcase,
      color: 'emerald',
      badgeVariant: 'success',
    },
    {
      id: 'SEEKING_EMPLOYMENT',
      label: 'Seeking Employment',
      description: 'Actively preparing and applying for target job roles.',
      icon: Search,
      color: 'indigo',
      badgeVariant: 'default',
    },
    {
      id: 'UNEMPLOYED',
      label: 'Unemployed',
      description: 'Currently not employed and identifying skill gaps.',
      icon: AlertTriangle,
      color: 'amber',
      badgeVariant: 'warning',
    },
    {
      id: 'SELF_EMPLOYED',
      label: 'Self-Employed',
      description: 'Freelancing, startup founder, or independent business owner.',
      icon: Building,
      color: 'purple',
      badgeVariant: 'purple',
    },
    {
      id: 'APPRENTICESHIP',
      label: 'Apprenticeship',
      description: 'Structured vocational training or internship program.',
      icon: Award,
      color: 'sky',
      badgeVariant: 'secondary',
    },
    {
      id: 'HIGHER_STUDIES',
      label: 'Higher Studies',
      description: 'Enrolled in post-graduate degree or specialized courses.',
      icon: GraduationCap,
      color: 'blue',
      badgeVariant: 'secondary',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Current Career Status
          </h2>
          <p className="text-xs text-slate-500">
            Select your current status to unlock relevant career tools and forms.
          </p>
        </div>
        {isSaving && (
          <Badge variant="secondary" className="animate-pulse text-xs">
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
              className={`p-4 cursor-pointer transition-all border-2 relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl font-bold ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {item.label}
                    </h3>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
