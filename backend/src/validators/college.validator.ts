import { z } from 'zod';

export const createCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'College name is required'),
    shortName: z.string().optional(),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().optional(),
    university: z.string().optional(),
    type: z.enum(['IIT', 'NIT', 'IIIT', 'Government', 'State University', 'Private', 'Deemed', 'Autonomous', 'Engineering College']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'College name is required').optional(),
    shortName: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    university: z.string().optional(),
    type: z.enum(['IIT', 'NIT', 'IIIT', 'Government', 'State University', 'Private', 'Deemed', 'Autonomous', 'Engineering College']).optional(),
    isActive: z.boolean().optional(),
  }),
});
