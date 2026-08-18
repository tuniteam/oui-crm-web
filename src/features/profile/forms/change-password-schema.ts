import { z } from 'zod';
import { CHANGE_PASSWORD_SHEET } from '../constants/change-password.constants';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const getChangePasswordSchema = () =>
  z
    .object({
      oldPassword: z
        .string()
        .min(1, CHANGE_PASSWORD_SHEET.ERRORS.OLD_PASSWORD_REQUIRED),

      newPassword: z
        .string()
        .min(8, CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_MIN)
        .max(100, CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_MAX)
        .regex(
          PASSWORD_REGEX,
          CHANGE_PASSWORD_SHEET.ERRORS.PASSWORD_COMPLEXITY,
        ),

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