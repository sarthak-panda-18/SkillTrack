'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, MapPin, DollarSign, Save, Edit3, X, ArrowRight, Brain } from 'lucide-react';

interface UnemploymentSectionProps {
  unemploymentDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function UnemploymentSection({
  unemploymentDetails,
  onUpdate,
  isUpdating,
}: UnemploymentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [reason, setReason] = useState(unemploymentDetails?.reason || 'Skill Gap');
  const [preferredLocation, setPreferredLocation] = useState(unemploymentDetails?.preferredLocation || 'Hyderabad / Remote');
  const [expectedSalary, setExpectedSalary] = useState(unemploymentDetails?.expectedSalary || 600000);

  const reasonsList = [
    'Skill Gap',
    'Technical Skills',
    'Interview Skills',
    'Communication',
    'Lack of Experience',
    'No Suitable Opportunities',
    'Location Constraint',
    'Salary Expectation',
    'Eligibility',
    'Personal Reason',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      reason,
      preferredLocation,
      expectedSalary,
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-b border-border mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            NON-PLACEMENT INFORMATION & SKILL REMEDIATION
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-sans">
            Log primary non-placement reasons to connect with AI Skill Gap Analysis.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold uppercase gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Information'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Reason for Unemployment *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                >
                  {reasonsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Preferred Work Location</label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Bangalore / Remote"
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Expected Salary (₹ per annum)</label>
                <input
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 600000"
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={isUpdating} className="font-bold text-xs uppercase gap-1.5">
              <Save className="h-4 w-4 text-black" /> Save Non-Placement Info
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/30 space-y-1">
                <span className="text-amber-500 dark:text-amber-400 font-mono font-bold text-[11px] block uppercase">Primary Reason</span>
                <span className="font-bold text-xl text-card-foreground uppercase">
                  {unemploymentDetails?.reason || 'Skill Gap'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                <span className="text-muted-foreground font-mono font-bold text-[11px] block flex items-center gap-1 uppercase">
                  <MapPin className="h-3.5 w-3.5 text-[#FFD400]" /> Preferred Location
                </span>
                <span className="font-bold text-xl text-card-foreground uppercase">
                  {unemploymentDetails?.preferredLocation || 'India'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                <span className="text-muted-foreground font-mono font-bold text-[11px] block flex items-center gap-1 uppercase">
                  <DollarSign className="h-3.5 w-3.5 text-[#FFD400]" /> Expected Salary
                </span>
                <span className="font-bold text-xl text-[#FFD400]">
                  ₹{((unemploymentDetails?.expectedSalary || 600000) / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>

            {/* AI Skill Gap Recommendation Integration */}
            <div className="p-5 rounded-sm bg-surface-secondary border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-base uppercase text-card-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#FFD400]" /> Resolution Action: AI Skill Gap Analysis
                </span>
                <p className="text-muted-foreground text-xs">
                  Analyze your missing skills and complete 20-question assessments to boost readiness.
                </p>
              </div>

              <Link href="/skill-gap">
                <Button variant="primary" className="font-bold text-xs uppercase shrink-0 gap-1.5">
                  <span>Analyze Skill Gaps</span> <ArrowRight className="h-4 w-4 text-black" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

