import { z } from 'zod';
import { CORRECT_EMAIL } from '../constants/correct-email.constants';

const M = CORRECT_EMAIL.SCHEMA;

export const getCorrectEmailSchema = () =>
  z.object({
    email: z.string().min(1, M.EMAIL_REQUIRED).email(M.EMAIL_INVALID),
  });

export type CorrectEmailSchemaType = z.infer<
  ReturnType<typeof getCorrectEmailSchema>
>;
