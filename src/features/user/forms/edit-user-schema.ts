import { z } from 'zod';
import { ZOD_ERRORS } from '../constants/users.constants';
import { CALENDAR_DAY_PATTERN, INITIALS_PATTERN } from './create-user-schema';

/**
 * PATCH /users/:id. Pas de `status` : le serveur le refuse, le statut se pilote
 * par la suspension et la re-creation. Pas d'e-mail non plus, il n'est pas
 * modifiable par cette route.
 */
export const getEditUserSchema = () =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, ZOD_ERRORS.REQUIRED)
        .max(100, ZOD_ERRORS.MAX_LENGTH),

      lastName: z
        .string()
        .trim()
        .min(1, ZOD_ERRORS.REQUIRED)
        .max(100, ZOD_ERRORS.MAX_LENGTH),

      initials: z
        .string()
        .trim()
        .min(1, ZOD_ERRORS.REQUIRED)
        .regex(INITIALS_PATTERN, ZOD_ERRORS.INVALID_INITIALS),

      roleCode: z.string().trim().min(1, ZOD_ERRORS.REQUIRED),

      /** Facultatif : la chaine vide signifie « aucun perimetre », donc
       *  l'acces a toute la base. Envoyee au serveur en `null`. */
      scopeId: z.string(),

      isExternal: z.boolean(),

      expiresAt: z
        .string()
        .trim()
        .regex(CALENDAR_DAY_PATTERN, ZOD_ERRORS.INVALID_DATE)
        .or(z.literal('')),
    })
    .refine((v) => !v.isExternal || v.expiresAt !== '', {
      path: ['expiresAt'],
      message: ZOD_ERRORS.EXPIRATION_REQUIRED,
    });

export type EditUserSchemaType = z.infer<ReturnType<typeof getEditUserSchema>>;
