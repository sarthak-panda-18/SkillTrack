import { apiClient } from '@/lib/api-client';
import { CareerRole, CareerRoleDetailResponse } from '@/types/careerRole';

export const careerRoleService = {
  async getPublicCareerRoles(search: string = '', category?: string): Promise<CareerRole[]> {
    const res = await apiClient.get<any>('/career-roles', {
      params: { search, category },
    });
    if (Array.isArray(res.data?.data?.roles)) return res.data.data.roles;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.roles)) return res.data.roles;
    return [];
  },

  async getCareerRoleDetails(roleId: string): Promise<CareerRoleDetailResponse> {
    const res = await apiClient.get<any>(`/career-roles/${roleId}`);
    return res.data?.data || res.data;
  },
};
