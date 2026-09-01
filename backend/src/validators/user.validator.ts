import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    profileImage: z.string().optional(),
    college: z.string().optional(),
    degree: z.string().optional(),
    branch: z.string().optional(),
    graduationYear: z.number().optional(),
    targetRole: z.string().optional(),
    targetDomain: z.string().optional(),
    experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  }),
});

export const onboardingSchema = z.object({
  body: z.object({
    college: z.string().min(1, 'College is required'),
    degree: z.string().min(1, 'Degree is required'),
    branch: z.string().min(1, 'Branch is required'),
    graduationYear: z.number().min(2024).max(2032),
    targetRole: z.string().min(1, 'Target role is required'),
    targetDomain: z.string().min(1, 'Target domain is required'),
    experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    skills: z.array(
      z.object({
        skillId: z.string(),
        proficiency: z.number().min(0).max(100),
        level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
      })
    ).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
