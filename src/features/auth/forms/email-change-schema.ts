import { z } from 'zod';
import { EMAIL_CHANGE } from '../constants/email-change.constants';

const M = EMAIL_CHANGE.SCHEMA;

export const getEmailChangeSchema = () =>
  z.object({
    newEmail: z
      .string()
      .min(1, M.REQUIRED)
      .email(M.NEW_EMAIL_INVALID),
    currentPassword: z.string().min(1, M.REQUIRED),
  });

export type EmailChangeSchemaType = z.infer<
  ReturnType<typeof getEmailChangeSchema>
>;
