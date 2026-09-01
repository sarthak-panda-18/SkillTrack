import { apiClient } from '@/lib/api-client';

export interface CommunicationLogItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  recipientEmail: string;
  initiatedByAdminId?: {
    _id: string;
    name: string;
    email: string;
  };
  type: string;
  subject: string;
  message: string;
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED';
  providerMessageId?: string;
  failureReason?: string;
  sentAt?: string;
  failedAt?: string;
  createdAt: string;
}

export interface GetCommunicationLogsResponse {
  success: boolean;
  logs: CommunicationLogItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendIndividualEmailResponse {
  success: boolean;
  message: string;
  logId?: string;
  status?: string;
}

export interface SendBulkEmailResponse {
  success: boolean;
  message: string;
  recipientCount: number;
  details?: Array<{ studentId: string; email: string; logId: string; status: string }>;
}

export const adminCommunicationService = {
  async sendIndividualEmail(studentId: string, subject: string, message: string): Promise<SendIndividualEmailResponse> {
    const res = await apiClient.post<SendIndividualEmailResponse>(`/admin/users/${studentId}/email`, { subject, message });
    return res.data;
  },

  async sendBulkEmail(studentIds: string[], subject: string, message: string): Promise<SendBulkEmailResponse> {
    const res = await apiClient.post<SendBulkEmailResponse>('/admin/users/bulk-email', { studentIds, subject, message });
    return res.data;
  },

  async getCommunicationLogs(page = 1, limit = 20, search = '', status = ''): Promise<GetCommunicationLogsResponse> {
    const res = await apiClient.get<GetCommunicationLogsResponse>('/admin/communication-logs', {
      params: { page, limit, search, status },
    });
    return res.data;
  },
};
