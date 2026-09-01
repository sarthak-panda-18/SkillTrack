import { apiClient } from '@/lib/api-client';
import { SkillGapAnalysis } from '@/types/skillGap';

export const skillGapService = {
  async getStudentSkillGap(): Promise<SkillGapAnalysis> {
    const res = await apiClient.get<any>('/skill-gap');
    return res.data?.data || res.data;
  },

  async recalculateSkillGap(): Promise<SkillGapAnalysis> {
    const res = await apiClient.post<any>('/skill-gap/analyze');
    return res.data?.data || res.data;
  },
};
