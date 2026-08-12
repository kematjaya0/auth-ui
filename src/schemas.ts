import { z } from 'zod';

export const authSchema = z.object({
  email: z.email('Enter a valid email').max(180),
  password: z.string().min(6, 'Use at least 6 characters').max(4096)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(4096),
  newPassword: z.string().min(6, 'Use at least 6 characters').max(4096)
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
