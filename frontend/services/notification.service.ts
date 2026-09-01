import { apiClient } from '@/lib/api-client';
import {
  NotificationListResponse,
  NotificationPreferences,
  AppNotification,
} from '@/types/notification';

export const notificationService = {
  async getUserNotifications(page = 1, limit = 20): Promise<NotificationListResponse> {
    const res = await apiClient.get<any>('/notifications', { params: { page, limit } });
    return res.data?.data || res.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<any>('/notifications/unread-count');
    return res.data?.data?.unreadCount ?? 0;
  },

  async markAsRead(id: string): Promise<AppNotification> {
    const res = await apiClient.patch<any>(`/notifications/${id}/read`);
    return res.data?.data?.notification || res.data;
  },

  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    const res = await apiClient.patch<any>('/notifications/read-all');
    return res.data?.data || res.data;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/notifications/${id}`);
    return res.data?.success || false;
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const res = await apiClient.get<any>('/notifications/preferences');
    return res.data?.data?.preferences || res.data;
  },

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const res = await apiClient.put<any>('/notifications/preferences', data);
    return res.data?.data?.preferences || res.data;
  },
};
