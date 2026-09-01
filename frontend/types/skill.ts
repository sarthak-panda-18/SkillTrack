export interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSkill {
  _id: string;
  userId: string;
  skillId: Skill;
  proficiency: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
  updatedAt: string;
}
