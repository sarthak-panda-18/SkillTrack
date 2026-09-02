'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AlertTriangle, Target, MapPin, DollarSign, Save, Edit3, X, ArrowRight, Brain } from 'lucide-react';

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
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Non-Placement Information & Skill Remediation
          </CardTitle>
          <CardDescription className="text-xs">
            Log primary non-placement reasons to connect with AI Skill Gap Analysis.
          </CardDescription>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold gap-1.5"
        >
          {isEditing ? <X className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
          <span>{isEditing ? 'Cancel' : 'Edit Information'}</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Unemployment *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  {reasonsList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Preferred Work Location</label>
                <input
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Bangalore / Remote"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Expected Salary (₹ per annum)</label>
                <input
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 600000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isUpdating} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Non-Placement Info
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-1">
                <span className="text-amber-700 dark:text-amber-400 font-bold text-[11px] block">Primary Reason</span>
                <span className="text-base font-extrabold text-amber-900 dark:text-amber-200">
                  {unemploymentDetails?.reason || 'Skill Gap'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-600" /> Preferred Location
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {unemploymentDetails?.preferredLocation || 'India'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Expected Salary
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{((unemploymentDetails?.expectedSalary || 600000) / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>

            {/* AI Skill Gap Recommendation Integration */}
            <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-extrabold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600" /> Resolution Action: AI Skill Gap Analysis
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Analyze your missing skills and complete 20-question assessments to boost readiness.
                </p>
              </div>

              <Link href="/skill-gap">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 gap-1.5">
                  <span>Analyze Skill Gaps</span> <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
