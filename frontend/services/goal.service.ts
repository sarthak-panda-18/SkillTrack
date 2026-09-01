import { apiClient } from '@/lib/api-client';
import { GoalsData, Goal, GoalQueryParams, CreateGoalInput, GoalRecommendation } from '@/types/goal';

export const goalService = {
  async getStudentGoals(params?: GoalQueryParams): Promise<GoalsData> {
    const response = await apiClient.get<any>('/goals', { params });
    return response.data?.data || response.data;
  },

  async createGoal(data: CreateGoalInput): Promise<Goal> {
    const response = await apiClient.post<any>('/goals', data);
    return response.data?.data || response.data;
  },

  async updateGoal(id: string, data: Partial<CreateGoalInput>): Promise<Goal> {
    const response = await apiClient.patch<any>(`/goals/${id}`, data);
    return response.data?.data || response.data;
  },

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/goals/${id}`);
  },

  async updateMilestoneStatus(
    goalId: string,
    milestoneId: string,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<Goal> {
    const response = await apiClient.patch<any>(`/goals/${goalId}/milestones/${milestoneId}`, { status });
    return response.data?.data || response.data;
  },

  async getGoalRecommendations(): Promise<GoalRecommendation[]> {
    const response = await apiClient.get<any>('/goals/recommendations');
    return response.data?.data || response.data;
  },
};
