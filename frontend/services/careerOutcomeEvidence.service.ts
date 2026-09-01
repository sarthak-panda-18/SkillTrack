import { apiClient } from '@/lib/api-client';
import { CareerOutcomeEvidenceData, EvidenceDocumentType } from '@/types/careerOutcomeEvidence';

export const careerOutcomeEvidenceService = {
  uploadEvidence: async (
    outcomeId: string,
    documentType: EvidenceDocumentType,
    file: File
  ): Promise<CareerOutcomeEvidenceData> => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await apiClient.post<{ success: boolean; data: CareerOutcomeEvidenceData }>(
      `/career-outcome/${outcomeId}/evidence`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  getEvidenceList: async (outcomeId: string): Promise<CareerOutcomeEvidenceData[]> => {
    const response = await apiClient.get<{ success: boolean; data: CareerOutcomeEvidenceData[] }>(
      `/career-outcome/${outcomeId}/evidence`
    );
    return response.data.data;
  },

  getEvidenceFileUrl: (outcomeId: string, evidenceId: string): string => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return `${baseURL}/career-outcome/${outcomeId}/evidence/${evidenceId}/file`;
  },

  downloadEvidenceFile: async (
    outcomeId: string,
    evidenceId: string,
    originalFileName: string,
    mimeType: string,
    isDownloadOnly: boolean = false
  ): Promise<void> => {
    const response = await apiClient.get(
      `/career-outcome/${outcomeId}/evidence/${evidenceId}/file`,
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

  deleteEvidence: async (outcomeId: string, evidenceId: string): Promise<void> => {
    await apiClient.delete(`/career-outcome/${outcomeId}/evidence/${evidenceId}`);
  },
};
