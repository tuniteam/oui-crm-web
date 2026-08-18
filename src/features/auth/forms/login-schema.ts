// features/auth/forms/login-schema.ts
import { z } from 'zod';
import { AUTH } from '../constants/auth.constants';

export const getLoginSchema = () =>
  z.object({
    email: z
      .string()
      .min(1, AUTH.ZOD.REQUIRED)
      .email(AUTH.ZOD.INVALID_EMAIL),

    password: z
      .string()
      .min(1, AUTH.ZOD.REQUIRED),


    rememberMe: z.boolean().optional(),
  });

export type LoginSchemaType = z.infer<
  ReturnType<typeof getLoginSchema>
>;
