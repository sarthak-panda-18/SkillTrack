import { apiClient } from '@/lib/api-client';
import { CareerReadinessData, ReadinessSnapshot, AchievementItem } from '@/types/progress';

export const progressService = {
  async getStudentProgress(): Promise<CareerReadinessData> {
    const response = await apiClient.get<any>('/progress');
    return response.data?.data || response.data;
  },

  async getReadinessHistory(): Promise<ReadinessSnapshot[]> {
    const response = await apiClient.get<any>('/progress/history');
    return response.data?.data || response.data;
  },

  async getAchievements(): Promise<AchievementItem[]> {
    const response = await apiClient.get<any>('/progress/achievements');
    return response.data?.data || response.data;
  },

  async refreshProgress(): Promise<CareerReadinessData> {
    const response = await apiClient.post<any>('/progress/refresh');
    return response.data?.data || response.data;
  },

  async getTimeline(params?: {
    page?: number;
    limit?: number;
    category?: string;
    dateFilter?: string;
    sort?: 'DESC' | 'ASC';
  }): Promise<import('@/types/timeline').TimelineData> {
    const response = await apiClient.get<any>('/progress/timeline', { params });
    return response.data?.data || response.data;
  },
};
