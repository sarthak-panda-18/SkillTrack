'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '@/services/opportunity.service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Building, Send, PlusCircle } from 'lucide-react';
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
      <div className="p-6 sm:p-8 rounded-sm bg-[#0A0A0A] text-white border border-white/10 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#111111] border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono font-bold uppercase tracking-wider">
            <Building className="h-3.5 w-3.5 text-[#FFD400]" />
            <span>PEER COMPANY & OPPORTUNITY CONTRIBUTIONS</span>
          </div>
          <h1 className="font-condensed text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            COMPANY INSIGHTS & PEER CONTRIBUTIONS <span className="text-[#FFD400]">🌐</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl font-sans">
            Share non-confidential hiring information, interview preparation tips, and role requirements to assist fellow trainees.
          </p>
        </div>
      </div>

      {/* Share Contribution Form */}
      <Card className="p-6 bg-[#0A0A0A] border-white/10 text-white rounded-sm">
        <CardHeader className="p-0 pb-4 border-b border-white/10 mb-4">
          <CardTitle className="font-condensed text-xl font-extrabold uppercase text-white flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-[#FFD400]" />
            CONTRIBUTE OPPORTUNITY / HIRING INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Job Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Backend Developer"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-mono font-bold text-zinc-300 uppercase block mb-1">General Hiring & Interview Information *</label>
              <textarea
                rows={3}
                required
                placeholder="Share general hiring process, technical skill expectations, and application advice (no confidential internal data)."
                value={hiringInfo}
                onChange={(e) => setHiringInfo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-sm border border-white/15 bg-black text-white font-mono text-xs focus:border-[#FFD400] focus:outline-none"
              />
            </div>

            <Button type="submit" isLoading={submitMutation.isPending} className="bg-[#FFD400] hover:bg-[#FFE033] text-black font-extrabold text-xs uppercase flex items-center gap-2">
              <Send className="h-4 w-4 text-black" /> Submit Contribution for Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

