import { apiClient } from '@/lib/api-client';
import { RegisterInput, LoginInput, User } from '@/types/user';
import { ApiResponse } from '@/types/api';

export const authService = {
  async register(data: RegisterInput): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data.data!;
  },

  async login(data: LoginInput): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data.data!;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getMe(): Promise<User | null> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    try {
      const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
      return res.data.data?.user || null;
    } catch {
      localStorage.removeItem('token');
      return null;
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data.message || 'Reset instructions sent';
  },

  async resetPassword(token: string, newPassword: string): Promise<string> {
    const res = await apiClient.post<ApiResponse>('/auth/reset-password', { token, newPassword });
    return res.data.message || 'Password reset successfully';
  },

  async googleAuth(credential: string): Promise<{ user: User; token: string }> {
    const res = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/google', { credential });
    if (res.data.data?.token) {
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data.data!;
  },
};
