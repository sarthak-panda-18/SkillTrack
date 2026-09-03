'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Award, Save, Edit3, X } from 'lucide-react';

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
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-b border-border mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-[#FFD400]" />
            APPRENTICESHIP & VOCATIONAL TRAINING DETAILS
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-sans">
            Log active apprenticeship organizations, stipend, and skill training relevance.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold uppercase gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Organization *</label>
                <input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Apex Cloud Systems"
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Apprenticeship Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Cloud DevOps Trainee"
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Monthly Stipend (₹)</label>
                <input
                  type="number"
                  value={stipend}
                  onChange={(e) => setStipend(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isUpdating} className="font-bold text-xs uppercase gap-1.5">
              <Save className="h-4 w-4 text-black" /> Save Apprenticeship Details
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            {!apprenticeshipDetails?.organizationName ? (
              <div className="p-4 text-center text-muted-foreground bg-surface-secondary rounded-sm border border-dashed border-border space-y-2">
                <p className="font-bold text-card-foreground text-base uppercase">Provide apprenticeship information</p>
                <p className="text-xs">Click "Edit Details" to record organization, role, and stipend.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-sm bg-[#FFD400]/10 border border-[#FFD400]/40 space-y-1">
                  <span className="text-[#FFD400] font-mono font-bold text-[11px] block uppercase">Organization</span>
                  <span className="font-bold text-xl text-card-foreground uppercase">
                    {apprenticeshipDetails.organizationName}
                  </span>
                </div>

                <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                  <span className="text-muted-foreground font-mono font-bold text-[11px] block uppercase">Apprenticeship Role</span>
                  <span className="font-bold text-xl text-card-foreground uppercase">
                    {apprenticeshipDetails.role}
                  </span>
                </div>

                <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                  <span className="text-muted-foreground font-mono font-bold text-[11px] block uppercase">Monthly Stipend</span>
                  <span className="font-bold text-xl text-[#FFD400]">
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

