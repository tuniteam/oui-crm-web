import { z } from 'zod';
import { ACTIVATION } from '../constants/activation.constants';
const M = ACTIVATION.SCHEMA;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, M.PASSWORD.REQUIRED)
      .min(8, M.PASSWORD.MIN)
      .regex(/[A-Z]/, M.PASSWORD.UPPER)
      .regex(/[a-z]/, M.PASSWORD.LOWER)
      .regex(/[0-9]/, M.PASSWORD.NUMBER)
      .regex(/[^A-Za-z0-9]/, M.PASSWORD.SPECIAL),

    confirmPassword: z.string().min(1, M.PASSWORD.REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: M.PASSWORD.MATCH,
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;