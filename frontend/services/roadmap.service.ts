import { apiClient } from '@/lib/api-client';
import { LearningRoadmap } from '@/types/roadmap';

export const roadmapService = {
  async getStudentRoadmap(): Promise<LearningRoadmap> {
    const res = await apiClient.get<any>('/roadmap');
    return res.data?.data || res.data;
  },

  async generateRoadmap(): Promise<LearningRoadmap> {
    const res = await apiClient.post<any>('/roadmap/generate');
    return res.data?.data || res.data;
  },

  async regenerateRoadmap(): Promise<LearningRoadmap> {
    const res = await apiClient.post<any>('/roadmap/regenerate');
    return res.data?.data || res.data;
  },

  async updateTopicProgress(topicId: string, progress: number): Promise<LearningRoadmap> {
    const res = await apiClient.patch<any>(`/roadmap/topics/${topicId}/progress`, { progress });
    return res.data?.data || res.data;
  },

  async completeTopic(topicId: string): Promise<LearningRoadmap> {
    const res = await apiClient.post<any>(`/roadmap/topics/${topicId}/complete`);
    return res.data?.data || res.data;
  },

  async getTopicResource(topicId: string): Promise<any> {
    const res = await apiClient.get<any>(`/roadmap/topics/${topicId}/resource`);
    return res.data?.data || res.data;
  },

  async refreshTopicResource(topicId: string): Promise<any> {
    const res = await apiClient.post<any>(`/roadmap/topics/${topicId}/resource/refresh`);
    return res.data?.data || res.data;
  },
};
