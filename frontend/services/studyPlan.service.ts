import { apiClient } from '@/lib/api-client';
import { StudyPlan, StudyPlanPreferences } from '@/types/studyPlan';

export const studyPlanService = {
  async getStudentStudyPlan(): Promise<StudyPlan> {
    const res = await apiClient.get<any>('/study-plan');
    return res.data?.data || res.data;
  },

  async generateStudyPlan(prefs: Partial<StudyPlanPreferences>): Promise<StudyPlan> {
    const res = await apiClient.post<any>('/study-plan/generate', prefs);
    return res.data?.data || res.data;
  },

  async regenerateStudyPlan(): Promise<StudyPlan> {
    const res = await apiClient.post<any>('/study-plan/regenerate');
    return res.data?.data || res.data;
  },

  async getTodayPlan(): Promise<any> {
    const res = await apiClient.get<any>('/study-plan/today');
    return res.data?.data || res.data;
  },

  async updateTaskStatus(taskId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'): Promise<StudyPlan> {
    const res = await apiClient.patch<any>(`/study-plan/tasks/${taskId}`, { status });
    return res.data?.data || res.data;
  },

  async rescheduleTask(taskId: string, targetDate: string): Promise<StudyPlan> {
    const res = await apiClient.post<any>(`/study-plan/tasks/${taskId}/reschedule`, { targetDate });
    return res.data?.data || res.data;
  },
};
