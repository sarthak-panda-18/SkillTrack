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
    <Card className="p-6">
      <CardHeader className="p-0 pb-4 border-b border-border mb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-[#FFD400]" />
            JOB SEARCH & READINESS INFORMATION
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-sans">
            Manage your active job search status, target salary expectations, and preferred work location.
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
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Job Search Status</label>
                <select
                  value={jobSearchStatus}
                  onChange={(e) => setJobSearchStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-input bg-background text-foreground font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                >
                  <option value="Actively Applying">Actively Applying</option>
                  <option value="Preparing for Interviews">Preparing for Interviews</option>
                  <option value="Open to Offers">Open to Offers</option>
                </select>
              </div>

              <div>
                <label className="font-mono font-bold text-muted-foreground uppercase block mb-1">Preferred Location</label>
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
              <Save className="h-4 w-4 text-black" /> Save Job Search Details
            </Button>
          </form>
        ) : (
          <div className="space-y-6 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                <span className="text-muted-foreground font-mono font-bold text-[11px] block uppercase">Job Search Status</span>
                <Badge variant="default" className="font-mono font-bold text-[10px] bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/40 uppercase">
                  {seekingEmploymentDetails?.jobSearchStatus || 'Actively Applying'}
                </Badge>
              </div>

              <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                <span className="text-muted-foreground font-mono font-bold text-[11px] block flex items-center gap-1 uppercase">
                  <MapPin className="h-3.5 w-3.5 text-[#FFD400]" /> Preferred Location
                </span>
                <span className="font-bold text-xl text-card-foreground uppercase">
                  {seekingEmploymentDetails?.preferredLocation || 'India'}
                </span>
              </div>

              <div className="p-4 rounded-sm bg-surface-secondary border border-border space-y-1">
                <span className="text-muted-foreground font-mono font-bold text-[11px] block flex items-center gap-1 uppercase">
                  <DollarSign className="h-3.5 w-3.5 text-[#FFD400]" /> Expected Salary
                </span>
                <span className="font-bold text-xl text-[#FFD400]">
                  ₹{((seekingEmploymentDetails?.expectedSalary || 600000) / 100000).toFixed(1)} LPA
                </span>
              </div>
            </div>

            <div className="p-5 rounded-sm bg-surface-secondary border border-border flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-bold text-base uppercase text-card-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[#FFD400]" /> Assessment Readiness
                </span>
                <p className="text-muted-foreground text-xs">
                  Solve 20-question skill evaluations to prove technical competence.
                </p>
              </div>

              <Link href="/assessment">
                <Button variant="primary" className="font-bold text-xs uppercase gap-1.5 shrink-0">
                  <span>Take Assessment</span> <ArrowRight className="h-4 w-4 text-black" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

