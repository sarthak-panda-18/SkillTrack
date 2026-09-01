import { apiClient } from '@/lib/api-client';
import { Skill, UserSkill } from '@/types/skill';
import { SkillGrowthData, SkillGrowthQueryParams } from '@/types/skillGrowth';

export const skillService = {
  async getAllSkills(): Promise<Skill[]> {
    const res = await apiClient.get<any>('/skills');
    if (Array.isArray(res.data?.data?.skills)) return res.data.data.skills;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.skills)) return res.data.skills;
    return [];
  },

  async getUserSkills(): Promise<UserSkill[]> {
    const res = await apiClient.get<any>('/skills/user/me');
    if (Array.isArray(res.data?.data?.userSkills)) return res.data.data.userSkills;
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.userSkills)) return res.data.userSkills;
    return [];
  },

  async addUserSkill(skillId: string, proficiency: number, level?: 'Beginner' | 'Intermediate' | 'Advanced'): Promise<UserSkill> {
    const res = await apiClient.post<any>('/skills/user/me', {
      skillId,
      proficiency,
      level,
    });
    return res.data?.data?.userSkill || res.data?.userSkill || res.data?.data || res.data;
  },

  async removeUserSkill(skillId: string): Promise<void> {
    await apiClient.delete(`/skills/user/me/${skillId}`);
  },

  async getSkillGrowth(params?: SkillGrowthQueryParams): Promise<SkillGrowthData> {
    const res = await apiClient.get<any>('/skills/growth', { params });
    return res.data?.data || res.data;
  },

  async getSkillHistory(skillId: string): Promise<any> {
    const res = await apiClient.get<any>(`/skills/${skillId}/history`);
    return res.data?.data || res.data;
  },
};

