import { apiClient } from '@/lib/api-client';
import { CareerOutcomeData } from '@/types/careerOutcome';

export const careerOutcomeService = {
  async getCurrentOutcome(): Promise<CareerOutcomeData | null> {
    const response = await apiClient.get<any>('/career-outcome');
    return response.data?.data || null;
  },

  async getOutcomeHistory(): Promise<CareerOutcomeData[]> {
    const response = await apiClient.get<any>('/career-outcome/history');
    return response.data?.data || [];
  },

  async createOutcome(payload: any): Promise<CareerOutcomeData> {
    const response = await apiClient.post<any>('/career-outcome', payload);
    return response.data?.data || response.data;
  },

  async updateOutcome(id: string, payload: any): Promise<CareerOutcomeData> {
    const response = await apiClient.patch<any>(`/career-outcome/${id}`, payload);
    return response.data?.data || response.data;
  },

  async archiveOutcome(id: string): Promise<CareerOutcomeData> {
    const response = await apiClient.post<any>(`/career-outcome/archive/${id}`);
    return response.data?.data || response.data;
  },

  async getConsentStatus(): Promise<{ consentGiven: boolean; consentDate?: string; consentVersion?: string; consentPurpose?: string[] }> {
    const response = await apiClient.get<any>('/career-outcome/consent');
    return response.data?.data || { consentGiven: false };
  },

  async updateConsent(consentGiven: boolean, consentPurpose?: string[]): Promise<any> {
    const response = await apiClient.post<any>('/career-outcome/consent', { consentGiven, consentPurpose });
    return response.data?.data;
  },

  async getStudentFollowUps(): Promise<any[]> {
    const response = await apiClient.get<any>('/career-outcome/follow-ups');
    return response.data?.data || [];
  },

  async submitFollowUpResponse(followUpId: string, payload: any): Promise<any> {
    const response = await apiClient.post<any>(`/career-outcome/follow-ups/${followUpId}`, payload);
    return response.data?.data;
  },
};
