import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'SUSPENDED']),
  }),
});

export const updateSkillAdminSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Skill name is required').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
