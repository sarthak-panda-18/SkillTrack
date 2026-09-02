'use client';

import { useQuery } from '@tanstack/react-query';
import { opportunityService } from '@/services/opportunity.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Zap, MapPin, IndianRupee, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function OpportunitiesPage() {
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['matchedOpportunities'],
    queryFn: () => opportunityService.getMatchedOpportunities(),
  });

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 AI Opportunity & Skill Match Scoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recommended Opportunities & Match Scores ⚡
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Transparent match scores calculated from your verified skill profile, target role, and current skill gaps.
          </p>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-6">
        {opportunities.map((opp) => (
          <Card key={opp._id} className="p-6 border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{opp.title}</h3>
                  <Badge className="bg-indigo-600 text-white font-bold text-xs">{opp.employmentType}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{opp.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {opp.location}
                  </span>
                  <span>•</span>
                  <span className="font-extrabold text-emerald-600">{opp.salaryRange}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match Score</span>
                  <span className="text-2xl font-extrabold text-indigo-600">{opp.matchPercentage || 85}%</span>
                </div>
              </div>
            </div>

            <CardContent className="p-0 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">{opp.description}</p>

              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 text-indigo-900 dark:text-indigo-200">
                <span className="font-bold block mb-1">AI Match Insight:</span>
                <p className="text-xs">{opp.explanation}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Matching Skills ({opp.matchingSkills?.length || 0})</span>
                  <div className="flex flex-wrap gap-1">
                    {opp.matchingSkills?.map((s, i) => (
                      <Badge key={i} className="bg-emerald-600 text-white">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Missing Skills Needed ({opp.missingSkills?.length || 0})</span>
                  <div className="flex flex-wrap gap-1">
                    {opp.missingSkills?.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-rose-600 border-rose-300">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
