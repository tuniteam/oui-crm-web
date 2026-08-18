import { z } from 'zod';
import { ZOD_ERRORS } from '../constants/users.constants';

export const getCreateUserSchema = () =>
  z.object({
    firstName: z
      .string()
      .min(1, ZOD_ERRORS.REQUIRED)
      .max(100, ZOD_ERRORS.MAX_LENGTH),

    lastName: z
      .string()
      .min(1, ZOD_ERRORS.REQUIRED)
      .max(100, ZOD_ERRORS.MAX_LENGTH),

    email: z.string().email(ZOD_ERRORS.INVALID_EMAIL),

    roleId: z.string().min(1, ZOD_ERRORS.REQUIRED),
  });

export type CreateUserSchemaType = z.infer<ReturnType<typeof getCreateUserSchema>>;
