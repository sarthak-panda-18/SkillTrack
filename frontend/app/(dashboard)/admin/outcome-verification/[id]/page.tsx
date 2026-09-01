'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  Briefcase,
  User,
  Building2,
  GraduationCap,
  Rocket,
  Download,
  History,
  MessageSquare,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminOutcomeVerificationService } from '@/services/adminOutcomeVerification.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function AdminOutcomeReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const outcomeId = params.id as string;

  const [activeModal, setActiveModal] = useState<'VERIFY' | 'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [reasonInput, setReasonInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const handleAdminViewOrDownload = async (doc: any) => {
    setDownloadingDocId(doc._id);
    try {
      await adminOutcomeVerificationService.downloadAdminEvidenceFile(
        outcomeId,
        doc._id,
        doc.originalFileName,
        doc.mimeType
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        toast.error('Admin permission required.');
      } else if (err.response?.status === 404) {
        toast.error('Evidence file not found.');
      } else {
        toast.error('Failed to load evidence file.');
      }
    } finally {
      setDownloadingDocId(null);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'outcome-verification', outcomeId],
    queryFn: () => adminOutcomeVerificationService.getDetails(outcomeId),
    enabled: !!outcomeId,
  });

  const startReviewMutation = useMutation({
    mutationFn: () => adminOutcomeVerificationService.startReview(outcomeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outcome-verification', outcomeId] });
      toast.success('Review initiated.');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (notes?: string) => adminOutcomeVerificationService.verifyOutcome(outcomeId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outcome-verification'] });
      toast.success('Career outcome verified successfully!');
      setActiveModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify outcome.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reason, notes }: { reason: string; notes?: string }) =>
      adminOutcomeVerificationService.rejectOutcome(outcomeId, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outcome-verification'] });
      toast.success('Outcome rejected.');
      setActiveModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject outcome.');
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ reason, notes }: { reason: string; notes?: string }) =>
      adminOutcomeVerificationService.requestChanges(outcomeId, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outcome-verification'] });
      toast.success('Changes requested from student.');
      setActiveModal(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to request changes.');
    },
  });

  if (isLoading) {
    return (
      <PageWrapper className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </PageWrapper>
    );
  }

  if (isError || !data) {
    return (
      <PageWrapper className="max-w-5xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">Outcome submission not found</h2>
        <Link href="/admin/outcome-verification">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Verification Queue
          </Button>
        </Link>
      </PageWrapper>
    );
  }

  const { outcome, evidenceList, auditHistory } = data;
  const student = outcome.userId;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge variant="success" className="gap-1 font-mono uppercase text-xs font-black">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified
          </Badge>
        );
      case 'UNDER_REVIEW':
        return (
          <Badge variant="purple" className="gap-1 font-mono uppercase text-xs font-black">
            <Clock className="h-3.5 w-3.5 text-purple-600" /> Under Review
          </Badge>
        );
      case 'CHANGES_REQUESTED':
        return (
          <Badge variant="warning" className="gap-1 font-mono uppercase text-xs font-black">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Changes Requested
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="rose" className="gap-1 font-mono uppercase text-xs font-black">
            <XCircle className="h-3.5 w-3.5 text-rose-600" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-mono uppercase text-xs font-black">
            <FileCheck className="h-3.5 w-3.5 text-blue-600" /> Submitted
          </Badge>
        );
    }
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'VERIFY') {
      verifyMutation.mutate(notesInput);
    } else if (activeModal === 'REJECT') {
      if (!reasonInput.trim()) {
        toast.error('Rejection reason is required.');
        return;
      }
      rejectMutation.mutate({ reason: reasonInput, notes: notesInput });
    } else if (activeModal === 'REQUEST_CHANGES') {
      if (!reasonInput.trim()) {
        toast.error('Feedback reason for requested changes is required.');
        return;
      }
      requestChangesMutation.mutate({ reason: reasonInput, notes: notesInput });
    }
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href="/admin/outcome-verification"
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Outcome Review & Verification
            </h1>
            {getStatusBadge(outcome.verificationStatus)}
          </div>
        </div>

        {outcome.verificationStatus === 'SUBMITTED' && (
          <Button
            size="sm"
            isLoading={startReviewMutation.isPending}
            onClick={() => startReviewMutation.mutate()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
          >
            <Clock className="h-4 w-4" /> Start Review Process
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info Card */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" /> Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Name</span>
                <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{student?.name}</div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Email</span>
                <div className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{student?.email}</div>
              </div>
            </CardContent>
          </Card>

          {/* Outcome Details Card */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-600" /> Outcome Metadata ({outcome.outcomeType.replace('_', ' ')})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-4">
              {outcome.employment && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Company</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.employment.companyName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Job Role</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.employment.jobRole}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Joining Date</span>
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">
                      {new Date(outcome.employment.joiningDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Employment Type</span>
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">
                      {outcome.employment.employmentType} ({outcome.employment.workArrangement})
                    </div>
                  </div>
                </div>
              )}

              {outcome.selfEmployment && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Name</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.selfEmployment.businessName}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Type</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.selfEmployment.businessType}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Start Date</span>
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">
                      {new Date(outcome.selfEmployment.businessStartDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Status</span>
                    <div className="font-bold text-purple-600">{outcome.selfEmployment.currentStatus || 'Active'}</div>
                  </div>
                </div>
              )}

              {outcome.higherStudies && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Institution</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.higherStudies.institution}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Program</span>
                    <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{outcome.higherStudies.program}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Start Date</span>
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">
                      {new Date(outcome.higherStudies.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Admission Status</span>
                    <div className="font-bold text-blue-600">{outcome.higherStudies.admissionStatus || 'Enrolled'}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supporting Evidence List */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" /> Attached Supporting Evidence ({evidenceList.length})
                </span>
                <Badge variant="outline" className="text-[10px] font-mono gap-1">
                  <Lock className="h-3 w-3 text-emerald-600" /> Secure Admin Access
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs">
              {evidenceList.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">No evidence documents uploaded by student.</div>
              ) : (
                <div className="space-y-2.5">
                  {evidenceList.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-extrabold text-zinc-900 dark:text-zinc-100">{doc.originalFileName}</div>
                        <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          {doc.documentType.replace(/_/g, ' ')} • {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded{' '}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={downloadingDocId === doc._id}
                        disabled={downloadingDocId === doc._id}
                        onClick={() => handleAdminViewOrDownload(doc)}
                        className="text-xs font-bold text-indigo-600 border-indigo-200 dark:border-indigo-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloadingDocId === doc._id ? 'Opening...' : 'View / Stream'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Review Action Panel & Audit Log (1 col) */}
        <div className="space-y-6">
          {/* Review Decision Panel */}
          <Card className="shadow-md border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20">
            <CardHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-950 dark:text-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Admin Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Make an official verification decision for this student outcome.
              </p>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2"
                  onClick={() => {
                    setReasonInput('');
                    setNotesInput('');
                    setActiveModal('VERIFY');
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Verify Outcome
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs gap-2"
                  onClick={() => {
                    setReasonInput('');
                    setNotesInput('');
                    setActiveModal('REQUEST_CHANGES');
                  }}
                >
                  <AlertTriangle className="h-4 w-4" /> Request Changes
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs gap-2"
                  onClick={() => {
                    setReasonInput('');
                    setNotesInput('');
                    setActiveModal('REJECT');
                  }}
                >
                  <XCircle className="h-4 w-4" /> Reject Outcome
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit History Timeline */}
          <Card className="shadow-xs border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" /> Immutable Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs">
              {auditHistory.length === 0 ? (
                <div className="text-center text-zinc-400 py-4">No verification logs recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {auditHistory.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[9px] font-mono font-bold uppercase">
                          {item.action}
                        </Badge>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {item.reviewerId && (
                        <div className="text-[10px] text-zinc-500 font-medium">By Admin: {item.reviewerId.name}</div>
                      )}
                      {item.reason && (
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                          Reason: {item.reason}
                        </p>
                      )}
                      {item.notes && <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic">{item.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {activeModal === 'VERIFY'
                ? 'Confirm Outcome Verification'
                : activeModal === 'REQUEST_CHANGES'
                ? 'Request Changes from Student'
                : 'Reject Outcome Submission'}
            </h3>

            <p className="text-xs text-zinc-500">
              {activeModal === 'VERIFY'
                ? 'Confirm that you have reviewed the outcome metadata and attached evidence documents.'
                : activeModal === 'REQUEST_CHANGES'
                ? 'Specify the corrections required from the student before verification.'
                : 'Provide the official rejection reason for this submission.'}
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              {(activeModal === 'REJECT' || activeModal === 'REQUEST_CHANGES') && (
                <div className="space-y-1">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Reason * (Visible to student)
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter explicit feedback..."
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-zinc-700 dark:text-zinc-300">Admin Review Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Internal audit notes..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setActiveModal(null)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={
                    verifyMutation.isPending || rejectMutation.isPending || requestChangesMutation.isPending
                  }
                  className={`text-white font-bold text-xs ${
                    activeModal === 'VERIFY'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : activeModal === 'REQUEST_CHANGES'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm Action
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
