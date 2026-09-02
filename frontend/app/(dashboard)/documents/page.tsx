'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerOutcomeService } from '@/services/careerOutcome.service';
import { careerOutcomeEvidenceService } from '@/services/careerOutcomeEvidence.service';
import { EvidenceDocumentType } from '@/types/careerOutcomeEvidence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { FileText, Upload, Download, Trash2, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [selectedDocType, setSelectedDocType] = useState<EvidenceDocumentType>('OFFER_LETTER');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: currentOutcome } = useQuery({
    queryKey: ['career-outcome'],
    queryFn: () => careerOutcomeService.getCurrentOutcome(),
  });

  const { data: evidenceList = [] } = useQuery({
    queryKey: ['career-outcome', currentOutcome?._id, 'evidence'],
    queryFn: () => careerOutcomeEvidenceService.getEvidenceList(currentOutcome!._id),
    enabled: !!currentOutcome?._id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ docType, file }: { docType: EvidenceDocumentType; file: File }) =>
      careerOutcomeEvidenceService.uploadEvidence(currentOutcome!._id, docType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome', currentOutcome?._id, 'evidence'] });
      toast.success('Document evidence uploaded cleanly! Verification review triggered.');
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload evidence document.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (evidenceId: string) =>
      careerOutcomeEvidenceService.deleteEvidence(currentOutcome!._id, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome', currentOutcome?._id, 'evidence'] });
      toast.success('Document removed.');
    },
  });

  const docTypesList: Array<{ value: EvidenceDocumentType; label: string }> = [
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'INTERNSHIP_OFFER', label: 'Internship Offer Letter' },
    { value: 'JOINING_LETTER', label: 'Joining Letter' },
    { value: 'EMPLOYEE_ID_CARD', label: 'Employee ID Card' },
    { value: 'PAYSLIP', label: 'Salary Slip / Payslip' },
    { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
    { value: 'RELIEVING_LETTER', label: 'Relieving Letter' },
    { value: 'TRAINING_CERTIFICATE', label: 'Training Certificate' },
    { value: 'COURSE_CERTIFICATE', label: 'Course Certificate' },
    { value: 'OTHER', label: 'Other Employment Evidence' },
  ];

  return (
    <PageWrapper className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex justify-between items-center">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5 text-indigo-400" />
            <span>SIH 2026 Document & Payslip Evidence Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Document & Evidence Vault 📄
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Upload offer letters, payslips, and training certificates. Payslips are parsed automatically for declared vs evidence salary verification.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload New Evidence Document
          </CardTitle>
          <CardDescription className="text-xs">
            PDF, JPG, or PNG files up to 10 MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {!currentOutcome ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 font-medium">
              Please record your Current Career Outcome status before uploading supporting document evidence.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Document Type *</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as EvidenceDocumentType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  {docTypesList.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Select File *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                  className="w-full text-xs"
                />
              </div>

              {selectedFile && (
                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    onClick={() => uploadMutation.mutate({ docType: selectedDocType, file: selectedFile })}
                    isLoading={uploadMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload & Submit Evidence
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="p-6 border-slate-200 dark:border-slate-800">
        <CardHeader className="p-0 pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Uploaded Documents ({evidenceList.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3 text-xs">
          {evidenceList.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No documents uploaded yet.</p>
          ) : (
            evidenceList.map((doc: any) => (
              <div key={doc._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{doc.originalFileName}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{doc.documentType}</Badge>
                    {doc.extractedData?.salaryMatchStatus === 'MATCHED' && (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✓ Payslip Salary Matched</Badge>
                    )}
                    {doc.extractedData?.salaryMatchStatus === 'MISMATCHED' && (
                      <Badge className="bg-rose-600 text-white text-[10px] font-bold">⚠ Flagged Mismatch</Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">{doc.extractedData?.notes || 'Uploaded evidence document.'}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(doc._id)}
                  className="text-rose-600 hover:bg-rose-50 text-xs gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
