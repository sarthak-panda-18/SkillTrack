'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Rocket,
  GraduationCap,
  Wrench,
  Laptop,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Clock,
  History,
  PlusCircle,
  Edit3,
  Archive,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Globe,
  Users,
  Award,
  Upload,
  FileText,
  FileCheck,
  Download,
  Trash2,
  AlertCircle,
  Eye,
  Lock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { careerOutcomeService } from '@/services/careerOutcome.service';
import { careerOutcomeEvidenceService } from '@/services/careerOutcomeEvidence.service';
import { CareerOutcomeData, OutcomeType } from '@/types/careerOutcome';
import { CareerOutcomeEvidenceData, EvidenceDocumentType } from '@/types/careerOutcomeEvidence';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageWrapper } from '@/components/ui/PageWrapper';

export default function CareerOutcomePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedType, setSelectedType] = useState<OutcomeType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Evidence upload states
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<EvidenceDocumentType>('OFFER_LETTER');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    employment: {
      companyName: '',
      jobRole: '',
      employmentType: 'FULL_TIME',
      workArrangement: 'HYBRID',
      joiningDate: new Date().toISOString().split('T')[0],
      compensationAmount: '',
      currency: 'INR',
      workLocation: { city: '', state: '', country: 'India' },
      industry: 'Software',
    },
    selfEmployment: {
      businessName: '',
      businessType: 'STARTUP',
      businessStartDate: new Date().toISOString().split('T')[0],
      currentStatus: 'GROWING',
      teamSizeRange: '1',
      incomeRange: '5L_10L',
      currency: 'INR',
      industry: 'Software',
      website: '',
      description: '',
    },
    higherStudies: {
      institution: '',
      program: 'M.Tech',
      degree: 'Master of Technology',
      specialization: 'Computer Science & AI',
      country: 'India',
      city: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: '',
      admissionStatus: 'ENROLLED',
      studyMode: 'ON_CAMPUS',
      fundingType: 'SELF_FUNDED',
    },
    apprenticeship: {
      organization: '',
      role: '',
      startDate: new Date().toISOString().split('T')[0],
      workArrangement: 'ON_SITE',
    },
    internship: {
      companyName: '',
      internshipRole: '',
      startDate: new Date().toISOString().split('T')[0],
      isPaid: true,
      stipendAmount: '',
      currency: 'INR',
      workArrangement: 'HYBRID',
    },
    seekingEmployment: {
      seekingSince: new Date().toISOString().split('T')[0],
      preferredRole: 'Software Development Engineer',
      preferredWorkArrangement: 'HYBRID',
    },
  });

  const { data: currentOutcome, isLoading: loadingCurrent } = useQuery<CareerOutcomeData | null>({
    queryKey: ['career-outcome'],
    queryFn: () => careerOutcomeService.getCurrentOutcome(),
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery<CareerOutcomeData[]>({
    queryKey: ['career-outcome', 'history'],
    queryFn: () => careerOutcomeService.getOutcomeHistory(),
  });

  // Query evidence for active current outcome
  const { data: evidenceList = [], isLoading: loadingEvidence } = useQuery<CareerOutcomeEvidenceData[]>({
    queryKey: ['career-outcome', currentOutcome?._id, 'evidence'],
    queryFn: () => careerOutcomeEvidenceService.getEvidenceList(currentOutcome!._id),
    enabled: !!currentOutcome?._id,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEditing && currentOutcome) {
        return careerOutcomeService.updateOutcome(currentOutcome._id, payload);
      }
      return careerOutcomeService.createOutcome(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome'] });
      queryClient.invalidateQueries({ queryKey: ['career-outcome', 'history'] });
      toast.success(isEditing ? 'Career outcome updated successfully!' : 'Career outcome recorded!');
      setIsEditing(false);
      setIsCreatingNew(false);
      setSelectedType(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save career outcome.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      careerOutcomeService.updateOutcome(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome'] });
      toast.success('Status updated successfully!');
    },
  });

  const uploadEvidenceMutation = useMutation({
    mutationFn: ({ outcomeId, docType, file }: { outcomeId: string; docType: EvidenceDocumentType; file: File }) =>
      careerOutcomeEvidenceService.uploadEvidence(outcomeId, docType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome', currentOutcome?._id, 'evidence'] });
      toast.success('Supporting evidence document uploaded!');
      setSelectedFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    },
  });

  const deleteEvidenceMutation = useMutation({
    mutationFn: ({ outcomeId, evidenceId }: { outcomeId: string; evidenceId: string }) =>
      careerOutcomeEvidenceService.deleteEvidence(outcomeId, evidenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['career-outcome', currentOutcome?._id, 'evidence'] });
      toast.success('Evidence document removed.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove document.');
    },
  });

  const handleStartEdit = () => {
    if (!currentOutcome) return;
    setSelectedType(currentOutcome.outcomeType);
    setIsEditing(true);
    setIsCreatingNew(false);

    if (currentOutcome.employment) {
      const emp = currentOutcome.employment;
      setFormData((prev: any) => ({
        ...prev,
        employment: {
          ...prev.employment,
          ...emp,
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
        },
      }));
    }
    if (currentOutcome.selfEmployment) {
      const self = currentOutcome.selfEmployment;
      setFormData((prev: any) => ({
        ...prev,
        selfEmployment: {
          ...prev.selfEmployment,
          ...self,
          businessStartDate: self.businessStartDate ? new Date(self.businessStartDate).toISOString().split('T')[0] : '',
        },
      }));
    }
    if (currentOutcome.higherStudies) {
      const hs = currentOutcome.higherStudies;
      setFormData((prev: any) => ({
        ...prev,
        higherStudies: {
          ...prev.higherStudies,
          ...hs,
          startDate: hs.startDate ? new Date(hs.startDate).toISOString().split('T')[0] : '',
          expectedCompletionDate: hs.expectedCompletionDate ? new Date(hs.expectedCompletionDate).toISOString().split('T')[0] : '',
        },
      }));
    }
    if (currentOutcome.internship) {
      const intern = currentOutcome.internship;
      setFormData((prev: any) => ({
        ...prev,
        internship: {
          ...prev.internship,
          ...intern,
          startDate: intern.startDate ? new Date(intern.startDate).toISOString().split('T')[0] : '',
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    const payload: any = { outcomeType: selectedType };
    if (selectedType === 'EMPLOYED') payload.employment = formData.employment;
    if (selectedType === 'SELF_EMPLOYED') payload.selfEmployment = formData.selfEmployment;
    if (selectedType === 'HIGHER_STUDIES') payload.higherStudies = formData.higherStudies;
    if (selectedType === 'APPRENTICESHIP') payload.apprenticeship = formData.apprenticeship;
    if (selectedType === 'INTERNSHIP') payload.internship = formData.internship;
    if (selectedType === 'SEEKING_EMPLOYMENT') payload.seekingEmployment = formData.seekingEmployment;

    saveMutation.mutate(payload);
  };

  const handleFileSelect = (file: File) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type.toLowerCase())) {
      toast.error('Unsupported file format. Please select PDF, JPG, JPEG, or PNG files.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleViewOrDownload = async (doc: any) => {
    if (!currentOutcome) return;
    setDownloadingDocId(doc._id);
    try {
      await careerOutcomeEvidenceService.downloadEvidenceFile(
        currentOutcome._id,
        doc._id,
        doc.originalFileName,
        doc.mimeType
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error('Your session has expired. Please sign in again.');
      } else if (err.response?.status === 403) {
        toast.error('You do not have permission to access this document.');
      } else if (err.response?.status === 404) {
        toast.error('Evidence document file not found.');
      } else {
        toast.error('Unable to load document. Please try again.');
      }
    } finally {
      setDownloadingDocId(null);
    }
  };

  const getDocTypeOptions = (outcomeType?: OutcomeType): Array<{ value: EvidenceDocumentType; label: string }> => {
    if (outcomeType === 'EMPLOYED') {
      return [
        { value: 'OFFER_LETTER', label: 'Offer Letter' },
        { value: 'JOINING_LETTER', label: 'Joining Letter' },
        { value: 'EMPLOYMENT_LETTER', label: 'Employment Proof' },
        { value: 'OTHER', label: 'Other Document' },
      ];
    }
    if (outcomeType === 'SELF_EMPLOYED') {
      return [
        { value: 'BUSINESS_REGISTRATION', label: 'Business Registration' },
        { value: 'BUSINESS_CERTIFICATE', label: 'Business Certificate' },
        { value: 'OTHER', label: 'Other Business Proof' },
      ];
    }
    if (outcomeType === 'HIGHER_STUDIES') {
      return [
        { value: 'ADMISSION_LETTER', label: 'Admission Letter' },
        { value: 'ENROLLMENT_LETTER', label: 'Enrollment Proof' },
        { value: 'STUDENT_ID', label: 'Student ID' },
        { value: 'OTHER', label: 'Other Proof' },
      ];
    }
    if (outcomeType === 'INTERNSHIP') {
      return [
        { value: 'INTERNSHIP_OFFER', label: 'Internship Offer' },
        { value: 'INTERNSHIP_CERTIFICATE', label: 'Internship Certificate' },
        { value: 'COMPLETION_CERTIFICATE', label: 'Completion Certificate' },
        { value: 'OTHER', label: 'Other Proof' },
      ];
    }
    if (outcomeType === 'APPRENTICESHIP') {
      return [
        { value: 'APPRENTICESHIP_LETTER', label: 'Apprenticeship Letter' },
        { value: 'APPRENTICESHIP_CERTIFICATE', label: 'Apprenticeship Certificate' },
        { value: 'OTHER', label: 'Other Proof' },
      ];
    }
    return [{ value: 'OTHER', label: 'Other Proof' }];
  };

  if (loadingCurrent) {
    return (
      <PageWrapper className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </PageWrapper>
    );
  }

  const outcomeTypesList: Array<{
    type: OutcomeType;
    title: string;
    description: string;
    icon: any;
    color: string;
  }> = [
    {
      type: 'EMPLOYED',
      title: 'Employed',
      description: 'Working at a company in a full-time, part-time, or contract role.',
      icon: Briefcase,
      color: 'bg-emerald-500',
    },
    {
      type: 'SELF_EMPLOYED',
      title: 'Self-Employed / Founder',
      description: 'Building a business, freelancing, startup, or consultancy.',
      icon: Rocket,
      color: 'bg-purple-500',
    },
    {
      type: 'HIGHER_STUDIES',
      title: 'Higher Studies',
      description: 'Enrolled in M.Tech, M.S., MBA, PhD, or research degree.',
      icon: GraduationCap,
      color: 'bg-blue-500',
    },
    {
      type: 'APPRENTICESHIP',
      title: 'Apprenticeship',
      description: 'Engaged in a structured technical training program.',
      icon: Wrench,
      color: 'bg-amber-500',
    },
    {
      type: 'INTERNSHIP',
      title: 'Internship',
      description: 'Working as a paid or unpaid industry intern.',
      icon: Laptop,
      color: 'bg-indigo-500',
    },
    {
      type: 'SEEKING_EMPLOYMENT',
      title: 'Seeking Employment',
      description: 'Actively preparing and applying for career opportunities.',
      icon: Search,
      color: 'bg-rose-500',
    },
  ];

  return (
    <PageWrapper className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Phase 4.3 Career Evidence Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Career Outcome & Supporting Evidence
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your career status and securely attach supporting evidence documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'current' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('current')}
            className="text-xs font-bold gap-1.5"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Current Outcome
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('history')}
            className="text-xs font-bold gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            History ({history.length})
          </Button>
        </div>
      </div>

      {activeTab === 'history' ? (
        /* History Timeline Tab */
        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-600" />
              Career Outcome History Timeline
            </CardTitle>
            <CardDescription>All previously recorded active and historical outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {history.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500">No outcome records in history yet.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={item.status === 'ACTIVE' ? 'success' : 'secondary'}
                          className="text-[10px] font-mono uppercase font-black"
                        >
                          {item.status}
                        </Badge>
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {item.outcomeType.replace('_', ' ')}
                        </span>
                        {item.verificationStatus === 'VERIFIED' && (
                          <Badge variant="purple" className="text-[10px] font-mono uppercase font-black gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> ✓ Verified
                          </Badge>
                        )}
                        {item.verificationStatus === 'UNDER_REVIEW' && (
                          <Badge variant="purple" className="text-[10px] font-mono uppercase font-black gap-1">
                            <Clock className="h-3 w-3 text-purple-400" /> Under Review
                          </Badge>
                        )}
                        {item.verificationStatus === 'CHANGES_REQUESTED' && (
                          <Badge variant="warning" className="text-[10px] font-mono uppercase font-black gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-500" /> Changes Requested
                          </Badge>
                        )}
                        {item.verificationStatus === 'REJECTED' && (
                          <Badge variant="rose" className="text-[10px] font-mono uppercase font-black gap-1">
                            <XCircle className="h-3 w-3 text-rose-500" /> Rejected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {item.employment?.companyName
                          ? `${item.employment.jobRole} at ${item.employment.companyName}`
                          : item.selfEmployment?.businessName
                          ? `${item.selfEmployment.businessType} — ${item.selfEmployment.businessName} (${item.selfEmployment.currentStatus || 'Active'})`
                          : item.higherStudies?.institution
                          ? `${item.higherStudies.program} at ${item.higherStudies.institution} (${item.higherStudies.admissionStatus || 'Enrolled'})`
                          : item.internship?.companyName
                          ? `${item.internship.internshipRole} at ${item.internship.companyName}`
                          : item.apprenticeship?.organization
                          ? `${item.apprenticeship.role} at ${item.apprenticeship.organization}`
                          : item.outcomeType.replace('_', ' ')}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        Recorded {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {item.status === 'ACTIVE' && (
                      <Badge variant="purple" className="text-xs font-bold shrink-0">
                        Current Active Outcome
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Current Outcome & Capture Form Tab */
        <div className="space-y-6">
          {/* Display Current Active Outcome if exists and not editing/creating new */}
          {currentOutcome && !isEditing && !isCreatingNew && (
            <>
              <Card className="shadow-md border-2 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20">
                <CardHeader className="pb-3 border-b border-emerald-100 dark:border-emerald-900/40 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-emerald-950 dark:text-emerald-100">
                          {currentOutcome.outcomeType.replace('_', ' ')}
                        </CardTitle>
                        <Badge variant="success" className="text-[10px] uppercase font-black">
                          Active Outcome
                        </Badge>
                        {currentOutcome.verificationStatus === 'VERIFIED' && (
                          <Badge variant="purple" className="text-[10px] uppercase font-black gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> ✓ Verified Outcome
                          </Badge>
                        )}
                        {currentOutcome.verificationStatus === 'UNDER_REVIEW' && (
                          <Badge variant="purple" className="text-[10px] uppercase font-black gap-1">
                            <Clock className="h-3 w-3 text-purple-400" /> Under Review
                          </Badge>
                        )}
                        {currentOutcome.verificationStatus === 'CHANGES_REQUESTED' && (
                          <Badge variant="warning" className="text-[10px] uppercase font-black gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-500" /> Changes Requested
                          </Badge>
                        )}
                        {currentOutcome.verificationStatus === 'REJECTED' && (
                          <Badge variant="rose" className="text-[10px] uppercase font-black gap-1">
                            <XCircle className="h-3 w-3 text-rose-500" /> Rejected
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">Recorded Current Career Status</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleStartEdit} className="text-xs font-bold gap-1">
                      <Edit3 className="h-3.5 w-3.5" /> Edit Details
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                      onClick={() => {
                        setSelectedType(null);
                        setIsCreatingNew(true);
                      }}
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Record New Outcome
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4 text-xs">
                  {currentOutcome.verificationStatus === 'CHANGES_REQUESTED' && currentOutcome.changesRequestedReason && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                      <div className="font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" /> Admin Feedback — Changes Requested
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        "{currentOutcome.changesRequestedReason}"
                      </p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                        Upload updated or additional evidence documents below to resubmit for verification.
                      </p>
                    </div>
                  )}

                  {currentOutcome.verificationStatus === 'REJECTED' && currentOutcome.rejectionReason && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
                      <div className="font-extrabold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-rose-600" /> Admin Feedback — Outcome Rejected
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                        "{currentOutcome.rejectionReason}"
                      </p>
                    </div>
                  )}
                  {/* 1. EMPLOYED Active View */}
                  {currentOutcome.employment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Company</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.employment.companyName}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Job Role</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.employment.jobRole}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Joining Date</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {new Date(currentOutcome.employment.joiningDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SELF_EMPLOYED Active View */}
                  {currentOutcome.selfEmployment && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Name</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.selfEmployment.businessName}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Business Type</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.selfEmployment.businessType}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Status</span>
                        <div className="font-extrabold text-sm text-purple-600">
                          {currentOutcome.selfEmployment.currentStatus || 'Growing'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. HIGHER_STUDIES Active View */}
                  {currentOutcome.higherStudies && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Institution</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.higherStudies.institution}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Program</span>
                        <div className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          {currentOutcome.higherStudies.program}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Admission Status</span>
                        <div className="font-extrabold text-sm text-blue-600">
                          {currentOutcome.higherStudies.admissionStatus || 'Enrolled'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Supporting Evidence Card Section */}
              <Card className="shadow-md border border-zinc-200 dark:border-zinc-800">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-600" />
                        Supporting Evidence Documents (Optional)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Upload optional offer letters, certificates, or enrollment proofs for future verification.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono gap-1">
                      <Lock className="h-3 w-3 text-emerald-600" /> Private & Encrypted
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Upload Area */}
                  {currentOutcome.outcomeType !== 'SEEKING_EMPLOYMENT' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="w-full sm:w-64">
                          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                            Document Type
                          </label>
                          <select
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value as EvidenceDocumentType)}
                            className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                          >
                            {getDocTypeOptions(currentOutcome.outcomeType).map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex-1 w-full pt-5 sm:pt-0">
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragActive(true);
                            }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragActive(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleFileSelect(e.dataTransfer.files[0]);
                              }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                              dragActive
                                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40'
                                : selectedFile
                                ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                                : 'border-zinc-300 dark:border-zinc-800 hover:border-emerald-500 bg-zinc-50/50 dark:bg-zinc-900/50'
                            }`}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileSelect(e.target.files[0]);
                                }
                              }}
                            />
                            <Upload className="h-6 w-6 text-zinc-400 mx-auto mb-1" />
                            {selectedFile ? (
                              <div className="text-xs">
                                <span className="font-extrabold text-indigo-600 block">{selectedFile.name}</span>
                                <span className="text-[10px] text-zinc-400">{formatFileSize(selectedFile.size)}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                                  Drag & drop your document or click to browse
                                </span>
                                <span className="text-[10px] text-zinc-400 block mt-0.5">
                                  PDF, JPG or PNG • Maximum 10 MB per file (Up to 5 files)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedFile && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedFile(null)} className="text-xs">
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            isLoading={uploadEvidenceMutation.isPending}
                            onClick={() =>
                              uploadEvidenceMutation.mutate({
                                outcomeId: currentOutcome._id,
                                docType: selectedDocType,
                                file: selectedFile,
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                          >
                            <Upload className="h-3.5 w-3.5" /> Upload Evidence
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence Document List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-zinc-700 dark:text-zinc-300 tracking-wider">
                      Attached Documents ({evidenceList.length})
                    </h4>

                    {evidenceList.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center space-y-1">
                        <FileText className="h-6 w-6 text-zinc-400 mx-auto" />
                        <p className="text-xs text-zinc-500 font-medium">No supporting documents uploaded yet.</p>
                        <p className="text-[10px] text-zinc-400">
                          Adding evidence helps verify your outcome for future placement records.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {evidenceList.map((doc) => (
                          <div
                            key={doc._id}
                            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                                    {doc.originalFileName}
                                  </span>
                                  <Badge variant="success" className="text-[9px] uppercase font-mono font-black">
                                    Submitted
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium mt-0.5">
                                  <span>{doc.documentType.replace(/_/g, ' ')}</span>
                                  <span>•</span>
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  <span>•</span>
                                  <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                isLoading={downloadingDocId === doc._id}
                                disabled={downloadingDocId === doc._id}
                                onClick={() => handleViewOrDownload(doc)}
                                className="text-xs font-bold text-indigo-600 border-indigo-200 dark:border-indigo-950 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 gap-1.5"
                              >
                                <Download className="h-3.5 w-3.5" />
                                {downloadingDocId === doc._id ? 'Opening...' : 'View / Download'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-xs gap-1"
                                onClick={() => {
                                  if (confirm('Are you sure you want to remove this evidence document?')) {
                                    deleteEvidenceMutation.mutate({
                                      outcomeId: currentOutcome._id,
                                      evidenceId: doc._id,
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Form Section when creating or editing or when no active outcome exists */}
          {(!currentOutcome || isEditing || isCreatingNew) && (
            <div className="space-y-6">
              {/* Outcome Type Selector Cards */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Select Your Current Career Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outcomeTypesList.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setSelectedType(item.type)}
                        className={`p-5 rounded-2xl border text-left transition-all relative space-y-2 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-600 shadow-md'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className={`h-10 w-10 rounded-xl ${item.color} text-white flex items-center justify-center shadow-xs`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                        </div>
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                        <p className="text-xs text-zinc-500 leading-snug">{item.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Dynamic Form */}
              <AnimatePresence mode="wait">
                {selectedType && (
                  <motion.div
                    key={selectedType}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="shadow-md border border-zinc-200 dark:border-zinc-800">
                      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-emerald-600" />
                          Complete {selectedType.replace('_', ' ')} Details
                        </CardTitle>
                        <CardDescription>Enter outcome metadata below.</CardDescription>
                      </CardHeader>

                      <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                          {/* EMPLOYED Form Fields */}
                          {selectedType === 'EMPLOYED' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Company Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Google / Microsoft / ABC Tech"
                                  value={formData.employment.companyName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, companyName: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Job Role *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Software Development Engineer"
                                  value={formData.employment.jobRole}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, jobRole: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Current Salary (INR per annum) *</label>
                                <input
                                  type="number"
                                  required
                                  placeholder="e.g. 600000 (for ₹6.0 LPA)"
                                  value={formData.employment.compensationAmount || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, compensationAmount: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Previous Salary (INR per annum)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 450000 (if previous role existed)"
                                  value={formData.employment.previousCompensationAmount || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, previousCompensationAmount: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              {/* Calculated Salary Growth Display */}
                              {Number(formData.employment.compensationAmount) > 0 && Number(formData.employment.previousCompensationAmount) > 0 && (
                                <div className="sm:col-span-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block">Auto-Calculated Salary Progression:</span>
                                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                                      Growth Amount: ₹{(Number(formData.employment.compensationAmount) - Number(formData.employment.previousCompensationAmount)).toLocaleString()}
                                    </span>
                                  </div>
                                  <Badge variant="success" className="text-xs font-bold font-mono">
                                    +
                                    {(
                                      ((Number(formData.employment.compensationAmount) - Number(formData.employment.previousCompensationAmount)) /
                                        Number(formData.employment.previousCompensationAmount)) *
                                      100
                                    ).toFixed(1)}
                                    % Salary Growth
                                  </Badge>
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Joining Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.employment.joiningDate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, joiningDate: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Employment Type</label>
                                <select
                                  value={formData.employment.employmentType}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, employmentType: e.target.value as any },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                >
                                  <option value="FULL_TIME">Full Time</option>
                                  <option value="PART_TIME">Part Time</option>
                                  <option value="CONTRACT">Contract</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Work Location (City / Region)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Bangalore, Karnataka"
                                  value={formData.employment.workLocation?.city || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: {
                                        ...formData.employment,
                                        workLocation: { ...formData.employment.workLocation, city: e.target.value },
                                      },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Industry</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Software & Tech / FinTech"
                                  value={formData.employment.industry || ''}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      employment: { ...formData.employment, industry: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {/* SELF_EMPLOYED Form Fields */}
                          {selectedType === 'SELF_EMPLOYED' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Business / Venture Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. TechNova Solutions"
                                  value={formData.selfEmployment.businessName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      selfEmployment: { ...formData.selfEmployment, businessName: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Business Type *</label>
                                <select
                                  value={formData.selfEmployment.businessType}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      selfEmployment: { ...formData.selfEmployment, businessType: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                >
                                  <option value="STARTUP">Startup</option>
                                  <option value="FREELANCE">Freelance</option>
                                  <option value="CONSULTANCY">Consultancy</option>
                                  <option value="AGENCY">Agency</option>
                                  <option value="SMALL_BUSINESS">Small Business</option>
                                  <option value="FAMILY_BUSINESS">Family Business</option>
                                  <option value="ONLINE_BUSINESS">Online Business</option>
                                  <option value="OTHER">Other</option>
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Business Start Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.selfEmployment.businessStartDate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      selfEmployment: { ...formData.selfEmployment, businessStartDate: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {/* HIGHER_STUDIES Form Fields */}
                          {selectedType === 'HIGHER_STUDIES' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Institution *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. IIT Hyderabad"
                                  value={formData.higherStudies.institution}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      higherStudies: { ...formData.higherStudies, institution: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Program / Degree *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. M.Tech in Artificial Intelligence"
                                  value={formData.higherStudies.program}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      higherStudies: { ...formData.higherStudies, program: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Start Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.higherStudies.startDate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      higherStudies: { ...formData.higherStudies, startDate: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {/* INTERNSHIP Form Fields */}
                          {selectedType === 'INTERNSHIP' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Company Name *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. TechCorp"
                                  value={formData.internship.companyName}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      internship: { ...formData.internship, companyName: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Internship Role *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Software Development Intern"
                                  value={formData.internship.internshipRole}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      internship: { ...formData.internship, internshipRole: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Start Date *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.internship.startDate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      internship: { ...formData.internship, startDate: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>
                            </div>
                          )}

                          {/* SEEKING_EMPLOYMENT Form Fields */}
                          {selectedType === 'SEEKING_EMPLOYMENT' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Seeking Since *</label>
                                <input
                                  type="date"
                                  required
                                  value={formData.seekingEmployment.seekingSince}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      seekingEmployment: { ...formData.seekingEmployment, seekingSince: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="font-bold text-zinc-700 dark:text-zinc-300">Preferred Role</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Software Engineer / Data Analyst"
                                  value={formData.seekingEmployment.preferredRole}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      seekingEmployment: { ...formData.seekingEmployment, preferredRole: e.target.value },
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-medium"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {(isEditing || isCreatingNew) && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditing(false);
                                  setIsCreatingNew(false);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              type="submit"
                              isLoading={saveMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                            >
                              Save Outcome
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
