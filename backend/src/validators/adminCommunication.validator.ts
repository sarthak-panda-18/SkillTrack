import { z } from 'zod';

export const sendIndividualEmailSchema = z.object({
  body: z.object({
    subject: z
      .string({ required_error: 'Subject line is required.' })
      .min(1, 'Subject cannot be empty.')
      .max(200, 'Subject line cannot exceed 200 characters.')
      .trim(),
    message: z
      .string({ required_error: 'Message body is required.' })
      .min(1, 'Message body cannot be empty.')
      .trim(),
  }),
});

export const sendBulkEmailSchema = z.object({
  body: z.object({
    studentIds: z
      .array(z.string().min(1, 'Invalid student ID'), {
        required_error: 'List of student IDs is required.',
      })
      .min(1, 'Select at least one student recipient.')
      .max(500, 'Cannot send bulk email to more than 500 students at once.'),
    subject: z
      .string({ required_error: 'Subject line is required.' })
      .min(1, 'Subject cannot be empty.')
      .max(200, 'Subject line cannot exceed 200 characters.')
      .trim(),
    message: z
      .string({ required_error: 'Message body is required.' })
      .min(1, 'Message body cannot be empty.')
      .trim(),
  }),
});
