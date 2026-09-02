'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '@/services/opportunity.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Building, Send, CheckCircle2, PlusCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyInsightsPage() {
  const queryClient = useQueryClient();
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [location, setLocation] = useState('');
  const [hiringInfo, setHiringInfo] = useState('');

  const { data: insights = [] } = useQuery({
    queryKey: ['approvedInsights'],
    queryFn: () => opportunityService.getApprovedCompanyInsights(),
  });

  const submitMutation = useMutation({
    mutationFn: (payload: any) => opportunityService.submitCompanyInsight(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvedInsights'] });
      toast.success('Company hiring insight submitted! Sent for trainer moderation.');
      setCompanyName('');
      setJobRole('');
      setLocation('');
      setHiringInfo('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      companyName,
      jobRole,
      opportunityType: 'FULL_TIME',
      requiredSkills: ['Java', 'REST APIs'],
      location,
      hiringInfo,
    });
  };

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Building className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Peer Company & Opportunity Contributions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Company Insights & Peer Contributions 🌐
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Share non-confidential hiring information, interview preparation tips, and role requirements to assist fellow trainees.
          </p>
        </div>
      </div>

      {/* Share Contribution Form */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            Contribute Opportunity / Hiring Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Job Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Backend Developer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">General Hiring & Interview Information *</label>
              <textarea
                rows={3}
                required
                placeholder="Share general hiring process, technical skill expectations, and application advice (no confidential internal data)."
                value={hiringInfo}
                onChange={(e) => setHiringInfo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
              />
            </div>

            <Button type="submit" isLoading={submitMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2">
              <Send className="h-4 w-4" /> Submit Contribution for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
