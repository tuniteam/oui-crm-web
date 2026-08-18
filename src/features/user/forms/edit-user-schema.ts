// src/features/users/forms/edit-user-schema.ts
import { z } from 'zod';
import { ZOD_ERRORS } from '../constants/users.constants';
import { USER_STATUS_VALUES } from '../constants/userList.constants';

export const getEditUserSchema = () =>
  z.object({
    firstName: z.string().trim().min(1, ZOD_ERRORS.REQUIRED).max(100, ZOD_ERRORS.MAX_LENGTH),
    lastName: z.string().trim().min(1, ZOD_ERRORS.REQUIRED).max(100, ZOD_ERRORS.MAX_LENGTH),

    status: z.enum(USER_STATUS_VALUES),

    roleId: z.string().trim().min(1, ZOD_ERRORS.REQUIRED),
  });

export type EditUserSchemaType = z.infer<ReturnType<typeof getEditUserSchema>>;
