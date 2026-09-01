import { apiClient } from '@/lib/api-client';
import { CareerOutcomeData, VerificationStatus } from '@/types/careerOutcome';
import { CareerOutcomeEvidenceData } from '@/types/careerOutcomeEvidence';

export interface VerificationAuditRecord {
  _id: string;
  careerOutcomeId: string;
  studentId: string;
  reviewerId?: { _id: string; name: string; email: string };
  action: 'SUBMITTED' | 'START_REVIEW' | 'VERIFIED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'RESUBMITTED';
  previousStatus?: VerificationStatus;
  newStatus: VerificationStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface VerificationQueueResponse {
  outcomes: Array<CareerOutcomeData & { evidenceCount: number }>;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    pending: number;
    underReview: number;
    verified: number;
    changesRequested: number;
    rejected: number;
    total: number;
  };
}

export interface VerificationDetailsResponse {
  outcome: CareerOutcomeData & {
    userId: { _id: string; name: string; email: string; collegeId?: string; phone?: string; bio?: string; profilePicture?: string };
    verifiedBy?: { _id: string; name: string; email: string };
  };
  evidenceList: CareerOutcomeEvidenceData[];
  auditHistory: VerificationAuditRecord[];
}

export const adminOutcomeVerificationService = {
  getQueue: async (params?: { status?: string; outcomeType?: string; search?: string; page?: number }) => {
    const response = await apiClient.get<{ success: boolean; data: VerificationQueueResponse }>(
      '/admin/outcome-verification',
      { params }
    );
    return response.data.data;
  },

  getDetails: async (outcomeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: VerificationDetailsResponse }>(
      `/admin/outcome-verification/${outcomeId}`
    );
    return response.data.data;
  },

  startReview: async (outcomeId: string) => {
    const response = await apiClient.post<{ success: boolean; data: CareerOutcomeData }>(
      `/admin/outcome-verification/${outcomeId}/start-review`
    );
    return response.data.data;
  },

  verifyOutcome: async (outcomeId: string, notes?: string) => {
    const response = await apiClient.post<{ success: boolean; data: CareerOutcomeData }>(
      `/admin/outcome-verification/${outcomeId}/verify`,
      { notes }
    );
    return response.data.data;
  },

  rejectOutcome: async (outcomeId: string, reason: string, notes?: string) => {
    const response = await apiClient.post<{ success: boolean; data: CareerOutcomeData }>(
      `/admin/outcome-verification/${outcomeId}/reject`,
      { reason, notes }
    );
    return response.data.data;
  },

  requestChanges: async (outcomeId: string, reason: string, notes?: string) => {
    const response = await apiClient.post<{ success: boolean; data: CareerOutcomeData }>(
      `/admin/outcome-verification/${outcomeId}/request-changes`,
      { reason, notes }
    );
    return response.data.data;
  },

  getAdminEvidenceFileUrl: (outcomeId: string, evidenceId: string) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseURL}/admin/outcome-verification/${outcomeId}/file/${evidenceId}`;
  },

  downloadAdminEvidenceFile: async (
    outcomeId: string,
    evidenceId: string,
    originalFileName: string,
    mimeType: string,
    isDownloadOnly: boolean = false
  ): Promise<void> => {
    const response = await apiClient.get(
      `/admin/outcome-verification/${outcomeId}/file/${evidenceId}`,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], { type: mimeType || 'application/octet-stream' });
    const objectUrl = URL.createObjectURL(blob);

    if (!isDownloadOnly && (mimeType.includes('pdf') || mimeType.includes('image'))) {
      window.open(objectUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = originalFileName || 'evidence-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  },
};
