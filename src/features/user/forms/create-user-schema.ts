import { z } from 'zod';
import { ZOD_ERRORS } from '../constants/users.constants';

/** Regle du serveur, reprise telle quelle : 2 a 3 majuscules ou chiffres. */
export const INITIALS_PATTERN = /^[A-Z0-9]{2,3}$/;

/** Jour calendaire strict. Le serveur refuse une date-heure ISO. */
export const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getCreateUserSchema = () =>
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

      email: z.string().trim().email(ZOD_ERRORS.INVALID_EMAIL),

      initials: z
        .string()
        .trim()
        .min(1, ZOD_ERRORS.REQUIRED)
        .regex(INITIALS_PATTERN, ZOD_ERRORS.INVALID_INITIALS),

      roleCode: z.string().trim().min(1, ZOD_ERRORS.REQUIRED),

      /** Facultatif : la chaine vide signifie « aucun perimetre », donc l'acces
       *  a toute la base. Le champ n'est alors pas transmis. */
      scopeId: z.string(),

      isExternal: z.boolean(),

      expiresAt: z
        .string()
        .trim()
        .regex(CALENDAR_DAY_PATTERN, ZOD_ERRORS.INVALID_DATE)
        .or(z.literal('')),
    })
    // Le serveur renvoie EXPIRATION_REQUIRED_FOR_EXTERNAL : on l'attrape avant
    // l'aller-retour, l'utilisateur voit l'erreur sous le champ concerne.
    .refine((v) => !v.isExternal || v.expiresAt !== '', {
      path: ['expiresAt'],
      message: ZOD_ERRORS.EXPIRATION_REQUIRED,
    });

export type CreateUserSchemaType = z.infer<ReturnType<typeof getCreateUserSchema>>;
