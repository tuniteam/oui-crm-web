import { z } from 'zod';
import { ZOD, optionalText } from './organization-summary-schema';

/**
 * Saisie d'un contact — US-01-04.
 *
 * Les règles viennent du contrat, pas d'une supposition : `CreateContactDto`
 * de l'API rend **`firstName` et `lastName` obligatoires** (`@IsNotEmpty`), et
 * les longueurs sont celles des colonnes, nommées dans
 * `contacts.constants.ts`. Une première version avait inventé ces valeurs :
 * elle acceptait des saisies que le serveur refuse (civilité de 20 caractères,
 * téléphone de 40) et rendait le prénom facultatif alors qu'il est exigé.
 */
const MAX = {
  /** `CIVILITY_MAX_LENGTH` */
  CIVILITY: 10,
  /** `USER_NAME_MAX_LENGTH`, partagé avec les comptes */
  NAME: 100,
  /** `ROLE_MAX_LENGTH` */
  ROLE: 120,
  /** `EMAIL_MAX_LENGTH` */
  EMAIL: 255,
  /** `PHONE_MAX_LENGTH` */
  PHONE: 20,
  /** `NOTES_MAX_LENGTH` */
  NOTES: 2000,
} as const;

export const getContactSchema = () =>
  z.object({
    civility: optionalText(MAX.CIVILITY),
    firstName: z.string().trim().min(1, ZOD.REQUIRED).max(MAX.NAME, ZOD.MAX),
    lastName: z.string().trim().min(1, ZOD.REQUIRED).max(MAX.NAME, ZOD.MAX),
    role: optionalText(MAX.ROLE),
    email: z
      .string()
      .trim()
      .max(MAX.EMAIL, ZOD.MAX)
      .email(ZOD.EMAIL)
      .or(z.literal('')),
    phone: optionalText(MAX.PHONE),
    mobile: optionalText(MAX.PHONE),
    notes: z.string().max(MAX.NOTES, ZOD.MAX),
    isPrimary: z.boolean(),
    optOut: z.boolean(),
  });

export type ContactSchemaType = z.infer<ReturnType<typeof getContactSchema>>;

export const emptyContactValues = (): ContactSchemaType => ({
  civility: '',
  firstName: '',
  lastName: '',
  role: '',
  email: '',
  phone: '',
  mobile: '',
  notes: '',
  isPrimary: false,
  optOut: false,
});
