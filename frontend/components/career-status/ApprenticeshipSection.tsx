'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Award, Building, DollarSign, Calendar, Save, Edit3, X } from 'lucide-react';

interface ApprenticeshipSectionProps {
  apprenticeshipDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function ApprenticeshipSection({
  apprenticeshipDetails,
  onUpdate,
  isUpdating,
}: ApprenticeshipSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [organizationName, setOrganizationName] = useState(apprenticeshipDetails?.organizationName || '');
  const [role, setRole] = useState(apprenticeshipDetails?.role || '');
  const [stipend, setStipend] = useState(apprenticeshipDetails?.stipend || 25000);
  const [workLocation, setWorkLocation] = useState(apprenticeshipDetails?.workLocation || '');
  const [trainingRelevance, setTrainingRelevance] = useState(apprenticeshipDetails?.trainingRelevance || 'Highly Relevant');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      organizationName,
      role,
      stipend,
      workLocation,
      trainingRelevance,
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-sky-600" />
            Apprenticeship & Vocational Training Details
          </CardTitle>
          <CardDescription className="text-xs">
            Log active apprenticeship organizations, stipend, and skill training relevance.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Organization *</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex Cloud Systems"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Apprenticeship Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Cloud DevOps Trainee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly Stipend (₹)</label>
                <input
                  type="number"
                  value={stipend}
                  onChange={(e) => setStipend(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Apprenticeship Details
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {!apprenticeshipDetails?.organizationName ? (
              <div className="p-4 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold">Provide apprenticeship information</p>
                <p className="text-[11px]">Click "Edit Details" to record organization, role, and stipend.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-1">
                  <span className="text-sky-700 dark:text-sky-400 font-bold text-[11px] block">Organization</span>
                  <span className="text-base font-extrabold text-sky-900 dark:text-sky-200">
                    {apprenticeshipDetails.organizationName}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Apprenticeship Role</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {apprenticeshipDetails.role}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold text-[11px] block">Monthly Stipend</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    ₹{apprenticeshipDetails.stipend?.toLocaleString()} / mo
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
