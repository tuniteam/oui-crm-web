import { z } from 'zod';
import {
  PASSWORD_POLICY,
  PASSWORD_POLICY_MESSAGES,
} from '@/shared/constants/password-policy';

import { CHANGE_PASSWORD_SHEET } from '../constants/change-password.constants';

export const getChangePasswordSchema = () =>
  z
    .object({
      oldPassword: z
        .string()
        .min(1, CHANGE_PASSWORD_SHEET.ERRORS.OLD_PASSWORD_REQUIRED),

      newPassword: z
        .string()
        .min(
          PASSWORD_POLICY.MIN_LENGTH,
          PASSWORD_POLICY_MESSAGES.MIN_LENGTH,
        )
        .max(100, CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_MAX)
        .regex(PASSWORD_POLICY.LETTER, PASSWORD_POLICY_MESSAGES.LETTER)
        .regex(PASSWORD_POLICY.DIGIT, PASSWORD_POLICY_MESSAGES.DIGIT),

      confirmNewPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.oldPassword === values.newPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['newPassword'],
          message: CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_DIFFERENT,
        });
      }

      if (values.newPassword !== values.confirmNewPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmNewPassword'],
          message: CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_MATCH,
        });
      }
    });

export type ChangePasswordSchemaType = z.infer<
  ReturnType<typeof getChangePasswordSchema>
>;