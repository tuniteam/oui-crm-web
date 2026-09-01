import { z } from 'zod';
import { ZOD } from '../constants/constants';

const MAX = 100;

export const createBackofficeUserSchema = z.object({
  firstName: z.string().min(1, ZOD.REQUIRED).max(MAX, ZOD.MAX_LENGTH),
  lastName: z.string().min(1, ZOD.REQUIRED).max(MAX, ZOD.MAX_LENGTH),
  email: z
    .string()
    .min(1, ZOD.REQUIRED)
    .email(ZOD.INVALID_EMAIL)
    .max(MAX, ZOD.MAX_LENGTH),
  // Le code vient de GET /backoffice/roles : jamais de valeur en dur ici.
  roleCode: z.string().min(1, ZOD.REQUIRED),
});

export type CreateBackofficeUserSchema = z.infer<
  typeof createBackofficeUserSchema
>;
