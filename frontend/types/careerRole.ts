import { Skill } from './skill';

export interface CareerRole {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  level: 'Entry' | 'Mid' | 'Senior';
  isActive: boolean;
  requiredSkills?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerRoleSkillMapping {
  _id: string;
  careerRoleId: string;
  skillId: Skill;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  minimumProficiency: number;
  recommendedProficiency: number;
  priority: number;
  isRequired: boolean;
}

export interface CareerRoleDetailResponse {
  role: CareerRole;
  skills: CareerRoleSkillMapping[];
}
