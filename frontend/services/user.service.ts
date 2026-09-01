import { apiClient } from '@/lib/api-client';
import { User, OnboardingInput } from '@/types/user';
import { UserSkill } from '@/types/skill';
import { ApiResponse } from '@/types/api';

export const userService = {
  async getProfile(): Promise<{ user: User; skills: UserSkill[] }> {
    const res = await apiClient.get<ApiResponse<{ user: User; skills: UserSkill[] }>>('/users/me');
    return res.data.data!;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await apiClient.put<ApiResponse<{ user: User }>>('/users/me/profile', data);
    return res.data.data!.user;
  },

  async completeOnboarding(data: OnboardingInput): Promise<User> {
    const res = await apiClient.put<ApiResponse<{ user: User }>>('/users/me/onboarding', data);
    return res.data.data!.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const res = await apiClient.put<ApiResponse>('/users/me/password', { currentPassword, newPassword });
    return res.data.message || 'Password updated';
  },

  async deleteAccount(): Promise<string> {
    const res = await apiClient.delete<ApiResponse>('/users/me');
    localStorage.removeItem('token');
    return res.data.message || 'Account deleted';
  },
};
