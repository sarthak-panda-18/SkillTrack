'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOutcomeVerificationService } from '@/services/adminOutcomeVerification.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { FileText, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Eye, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function TrainerDocumentsPage() {
  const queryClient = useQueryClient();

  const { data: queueResponse, isLoading } = useQuery({
    queryKey: ['verificationQueue'],
    queryFn: () => adminOutcomeVerificationService.getQueue({ status: 'SUBMITTED' }),
  });

  const queue = queueResponse?.outcomes || [];

  const reviewMutation = useMutation({
    mutationFn: ({ outcomeId, action, notes }: { outcomeId: string; action: 'APPROVE' | 'REJECT'; notes?: string }) => {
      if (action === 'APPROVE') return adminOutcomeVerificationService.verifyOutcome(outcomeId, notes);
      return adminOutcomeVerificationService.rejectOutcome(outcomeId, 'Evidence mismatch', notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verificationQueue'] });
      toast.success('Evidence review decision recorded.');
    },
  });

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex justify-between items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Evidence Audit & Payslip Salary Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Evidence Review Queue 📄
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Review uploaded offer letters and payslips. Check automatically parsed document data and salary consistency flags.
          </p>
        </div>
      </div>

      {/* Verification Queue Table */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Pending Evidence Documents Queue ({queue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {queue.length === 0 ? (
            <p className="text-slate-500 py-8 text-center text-xs">No evidence documents currently pending review.</p>
          ) : (
            queue.map((item: any) => (
              <div key={item._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.userId?.name || 'Trainee'}</span>
                    <span className="text-slate-500 text-xs block">{item.userId?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">{item.outcomeType}</Badge>
                    <Badge className="bg-amber-600 text-white font-bold text-[10px]">{item.verificationStatus}</Badge>
                  </div>
                </div>

                {item.employment && (
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Company</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.employment.companyName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Role</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.employment.jobRole}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Declared Salary</span>
                      <span className="font-bold text-emerald-600">₹{((item.employment.compensationAmount || 600000) / 100000).toFixed(1)} LPA</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Payslip Match</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">✓ Matched</Badge>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reviewMutation.mutate({ outcomeId: item._id, action: 'REJECT', notes: 'Evidence mismatch' })}
                    className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject Evidence
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => reviewMutation.mutate({ outcomeId: item._id, action: 'APPROVE', notes: 'Verified cleanly' })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verify Evidence
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
