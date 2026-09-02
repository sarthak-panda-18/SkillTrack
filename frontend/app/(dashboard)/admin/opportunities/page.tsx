'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opportunityService } from '@/services/opportunity.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Zap, CheckCircle2, XCircle, Building, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainerOpportunitiesPage() {
  const queryClient = useQueryClient();

  const { data: queue = [] } = useQuery({
    queryKey: ['adminInsightsQueue'],
    queryFn: () => opportunityService.getAdminInsightsQueue(),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) =>
      opportunityService.moderateCompanyInsight(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminInsightsQueue'] });
      toast.success('Contribution moderation complete.');
    },
  });

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Opportunity Moderation & Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Opportunities & Contribution Moderation ⚡
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Manage platform job opportunities and moderate trainee-contributed company hiring insights.
          </p>
        </div>
      </div>

      {/* Moderation Queue */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-600" />
            Trainee Company Insights Moderation Queue ({queue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4 text-xs">
          {queue.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No trainee contributions currently pending moderation.</p>
          ) : (
            queue.map((item: any) => (
              <div key={item._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.companyName} — {item.jobRole}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{item.status}</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{item.hiringInfo}</p>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => moderateMutation.mutate({ id: item._id, status: 'REJECTED' })}
                    className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => moderateMutation.mutate({ id: item._id, status: 'APPROVED' })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Publish
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
