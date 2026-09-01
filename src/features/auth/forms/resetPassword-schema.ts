import { z } from 'zod';
import {
  PASSWORD_POLICY,
  PASSWORD_POLICY_MESSAGES,
} from '@/shared/constants/password-policy';

import { ACTIVATION } from '../constants/activation.constants';
const M = ACTIVATION.SCHEMA;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, M.PASSWORD.REQUIRED)
      .min(
        PASSWORD_POLICY.MIN_LENGTH,
        PASSWORD_POLICY_MESSAGES.MIN_LENGTH,
      )
      .regex(PASSWORD_POLICY.LETTER, PASSWORD_POLICY_MESSAGES.LETTER)
      .regex(PASSWORD_POLICY.DIGIT, PASSWORD_POLICY_MESSAGES.DIGIT),

    confirmPassword: z.string().min(1, M.PASSWORD.REQUIRED),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: M.PASSWORD.MATCH,
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;