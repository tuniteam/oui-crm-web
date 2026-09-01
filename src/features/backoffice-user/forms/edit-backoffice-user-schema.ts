import { z } from 'zod';
import { ZOD } from '../constants/constants';

const MAX = 100;

/** L'e-mail n'est pas modifiable : PATCH n'accepte que ces trois champs. */
export const editBackofficeUserSchema = z.object({
  firstName: z.string().min(1, ZOD.REQUIRED).max(MAX, ZOD.MAX_LENGTH),
  lastName: z.string().min(1, ZOD.REQUIRED).max(MAX, ZOD.MAX_LENGTH),
  roleCode: z.string().min(1, ZOD.REQUIRED),
});

export type EditBackofficeUserSchema = z.infer<typeof editBackofficeUserSchema>;
