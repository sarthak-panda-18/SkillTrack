'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, MapPin, DollarSign, Save, Edit3, X, ArrowRight, Brain } from 'lucide-react';

interface SeekingEmploymentSectionProps {
  seekingEmploymentDetails: any;
  onUpdate: (details: any) => void;
  isUpdating?: boolean;
}

export function SeekingEmploymentSection({
  seekingEmploymentDetails,
  onUpdate,
  isUpdating,
}: SeekingEmploymentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [preferredLocation, setPreferredLocation] = useState(seekingEmploymentDetails?.preferredLocation || 'Hyderabad / Remote');
  const [expectedSalary, setExpectedSalary] = useState(seekingEmploymentDetails?.expectedSalary || 600000);
  const [jobSearchStatus, setJobSearchStatus] = useState(seekingEmploymentDetails?.jobSearchStatus || 'Actively Applying');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      preferredLocation,
      expectedSalary,
      jobSearchStatus,
    });
    setIsEditing(false);
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            Job Search & Readiness Information
          </CardTitle>
          <CardDescription className="text-xs">
            Manage your active job search status, target salary expectations, and preferred work location.
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
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Search Status</label>
                <select
                  value={jobSearchStatus}
                  onChange={(e) => setJobSearchStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  <option value="Actively Applying">Actively Applying</option>
                  <option value="Preparing for Interviews">Preparing for Interviews</option>
                  <option value="Open to Offers">Open to Offers</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Preferred Location</label>
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

            <Button type="submit" isLoading={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5">
              <Save className="h-4 w-4" /> Save Job Search Details
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                <span className="text-indigo-700 dark:text-indigo-400 font-bold text-[11px] block">Job Search Status</span>
                <Badge variant="default" className="font-black text-[10px]">
                  {seekingEmploymentDetails?.jobSearchStatus || 'Actively Applying'}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-purple-600" /> Preferred Location
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {seekingEmploymentDetails?.preferredLocation || 'India'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold text-[11px] block flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Expected Salary
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ₹{((seekingEmploymentDetails?.expectedSalary || 600000) / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600" /> Assessment Readiness
                </span>
                <p className="text-slate-500 text-xs">
                  Solve 20-question skill evaluations to prove technical competence.
                </p>
              </div>

              <Link href="/assessment">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs gap-1.5 shrink-0">
                  <span>Take Assessment</span> <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
