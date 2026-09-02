import { apiClient } from '@/lib/api-client';

export interface TrainingFeedbackData {
  _id?: string;
  trainingRelevance: number;
  practicalExposure: number;
  interviewPrep: number;
  industryExposure: number;
  skillsTrained: string[];
  skillsUsed: string[];
  skillsMissing: string[];
  topicsToImprove?: string;
  comments?: string;
  createdAt?: string;
}

export const trainingFeedbackService = {
  async submitFeedback(payload: Partial<TrainingFeedbackData>): Promise<TrainingFeedbackData> {
    const response = await apiClient.post('/training-feedback', payload);
    return response.data;
  },

  async getStudentFeedback(): Promise<TrainingFeedbackData | null> {
    const response = await apiClient.get('/training-feedback/student');
    return response.data;
  },

  async getAggregatedFeedbackAnalytics(): Promise<any> {
    const response = await apiClient.get('/training-feedback/analytics');
    return response.data;
  },
};
