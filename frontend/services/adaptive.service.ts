import { apiClient } from '@/lib/api-client';
import { AdaptiveLearningState, AdaptiveRecommendation } from '@/types/adaptive';

export const adaptiveService = {
  async getAdaptiveState(): Promise<{
    state: AdaptiveLearningState;
    recommendations: AdaptiveRecommendation[];
  }> {
    const res = await apiClient.get<any>('/adaptive-learning');
    return res.data?.data || res.data;
  },

  async analyzeProgress(): Promise<{
    state: AdaptiveLearningState;
    recommendations: AdaptiveRecommendation[];
  }> {
    const res = await apiClient.post<any>('/adaptive-learning/analyze');
    return res.data?.data || res.data;
  },

  async updateRecommendationStatus(
    id: string,
    status: 'ACCEPTED' | 'DISMISSED' | 'COMPLETED'
  ): Promise<AdaptiveRecommendation> {
    const res = await apiClient.patch<any>(`/adaptive-learning/recommendations/${id}`, { status });
    return res.data?.data || res.data;
  },
};
