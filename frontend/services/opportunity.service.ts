import { apiClient } from '@/lib/api-client';

export interface OpportunityData {
  _id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  requiredSkills: string[];
  matchingSkills?: string[];
  missingSkills?: string[];
  matchPercentage?: number;
  experienceLevel: string;
  employmentType: string;
  description?: string;
  explanation?: string;
}

export interface CompanyInsightData {
  _id?: string;
  companyName: string;
  jobRole: string;
  opportunityType: string;
  requiredSkills: string[];
  location: string;
  experienceLevel: string;
  hiringInfo: string;
  applicationInfo?: string;
  status?: string;
  createdAt?: string;
}

export const opportunityService = {
  async submitCompanyInsight(payload: Partial<CompanyInsightData>): Promise<CompanyInsightData> {
    const response = await apiClient.post('/opportunities/insights', payload);
    return response.data;
  },

  async getApprovedCompanyInsights(): Promise<CompanyInsightData[]> {
    const response = await apiClient.get('/opportunities/insights');
    return response.data;
  },

  async getAdminInsightsQueue(): Promise<CompanyInsightData[]> {
    const response = await apiClient.get('/opportunities/admin/insights');
    return response.data;
  },

  async moderateCompanyInsight(id: string, status: 'APPROVED' | 'REJECTED'): Promise<CompanyInsightData> {
    const response = await apiClient.patch(`/opportunities/admin/insights/${id}`, { status });
    return response.data;
  },
};
