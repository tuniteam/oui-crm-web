import { z } from 'zod';
import { AUTH } from '../constants/auth.constants';

export const requestResetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, AUTH.ZOD.REQUIRED)
    .email(AUTH.ZOD.INVALID_EMAIL),
});

export type RequestResetPasswordSchema = z.infer<typeof requestResetPasswordSchema>;