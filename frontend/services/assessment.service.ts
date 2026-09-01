import { apiClient } from '@/lib/api-client';
import {
  Assessment,
  StartAssessmentResponse,
  SubmitAssessmentResponse,
  AttemptResultResponse,
} from '@/types/assessment';
import { AssessmentHistoryData, AssessmentHistoryQueryParams } from '@/types/assessmentHistory';

export const assessmentService = {
  async getPublicAssessments(skillId?: string): Promise<Assessment[]> {
    const res = await apiClient.get<any>('/assessments', { params: { skillId } });
    return res.data?.data?.assessments || [];
  },

  async getAssessmentById(id: string): Promise<{ assessment: Assessment; availableQuestionsCount: number }> {
    const res = await apiClient.get<any>(`/assessments/${id}`);
    return res.data?.data || res.data;
  },

  async startAssessment(id: string): Promise<StartAssessmentResponse> {
    const res = await apiClient.post<any>(`/assessments/${id}/start`);
    return res.data?.data || res.data;
  },

  async getAttemptForPlayer(attemptId: string): Promise<StartAssessmentResponse> {
    const res = await apiClient.get<any>(`/assessments/attempts/${attemptId}/play`);
    return res.data?.data || res.data;
  },

  async submitAssessment(
    attemptId: string,
    answers: Array<{ questionId: string; selectedOption: number }>
  ): Promise<SubmitAssessmentResponse> {
    const res = await apiClient.post<any>(`/assessments/attempts/${attemptId}/submit`, { answers });
    return res.data?.data || res.data;
  },

  async getAttemptResults(attemptId: string): Promise<AttemptResultResponse> {
    const res = await apiClient.get<any>(`/assessments/attempts/${attemptId}/results`);
    return res.data?.data || res.data;
  },

  async getUserAttemptHistory(params?: AssessmentHistoryQueryParams): Promise<AssessmentHistoryData> {
    const res = await apiClient.get<any>('/assessments/history', { params });
    return res.data?.data || res.data;
  },
};

