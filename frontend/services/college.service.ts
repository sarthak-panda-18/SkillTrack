import { apiClient } from '@/lib/api-client';
import { College } from '@/types/college';

export interface CollegeRequestPayload {
  studentName: string;
  studentEmail: string;
  collegeName: string;
  city: string;
  state: string;
}

export const collegeService = {
  async searchColleges(search: string = '', state?: string): Promise<College[]> {
    const res = await apiClient.get<any>('/colleges', {
      params: { search, state, limit: 25 },
    });
    if (Array.isArray(res.data?.data?.colleges)) return res.data.data.colleges;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.colleges)) return res.data.colleges;
    return [];
  },

  async requestCollegeAddition(data: CollegeRequestPayload): Promise<void> {
    await apiClient.post('/colleges/request', data);
  },
};
