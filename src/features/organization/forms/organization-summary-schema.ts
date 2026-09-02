import { z } from 'zod';
import { PRIORITY_VALUES } from '../types/organizationList';

const ZOD = {
  REQUIRED: 'Champ requis',
  MAX: 'Longueur maximale dépassée',
  EMAIL: 'Email invalide',
  SIRET: 'Le SIRET comporte 14 chiffres',
  DEPARTMENT: 'Département invalide (2 ou 3 caractères)',
  POSITIVE: 'Valeur invalide',
};

/** Champs texte facultatifs : la chaine vide vaut « efface ». */
const optionalText = (max = 200) =>
  z.string().trim().max(max, ZOD.MAX).or(z.literal(''));

/** Nombre facultatif saisi en texte : `<input type="number">` rend '' quand
 *  le champ est vide, et une chaine sinon. */
const optionalNumber = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 0), ZOD.POSITIVE);

export const getOrganizationSummarySchema = () =>
  z.object({
    name: z.string().trim().min(1, ZOD.REQUIRED).max(200, ZOD.MAX),
    type: z.string().trim().min(1, ZOD.REQUIRED),
    // 2 a 3 caracteres : `89`, `2A`, `974`.
    department: z
      .string()
      .trim()
      .regex(/^[0-9AB]{2,3}$/i, ZOD.DEPARTMENT),

    siret: z
      .string()
      .trim()
      .refine((v) => v === '' || /^\d{14}$/.test(v.replace(/\s/g, '')), ZOD.SIRET),
    inseeCode: optionalText(10),
    address: optionalText(),
    postalCode: optionalText(10),
    city: optionalText(120),
    epci: optionalText(),
    phone: optionalText(40),
    email: z.string().trim().email(ZOD.EMAIL).or(z.literal('')),
    website: optionalText(),

    population: optionalNumber,
    schoolCount: optionalNumber,
    childCount: optionalNumber,

    solution: z.string(),
    services: z.array(z.string()),
    tags: z.array(z.string()),

    priority: z.enum(PRIORITY_VALUES),
    notes: z.string().max(5000, ZOD.MAX),
  });

export type OrganizationSummarySchemaType = z.infer<
  ReturnType<typeof getOrganizationSummarySchema>
>;
