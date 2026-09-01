import { z } from 'zod';

export const createSkillSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Skill name is required'),
    category: z.string().min(1, 'Skill category is required'),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const addUserSkillSchema = z.object({
  body: z.object({
    skillId: z.string().min(1, 'Skill ID is required'),
    proficiency: z.number().min(0).max(100),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  }),
});
