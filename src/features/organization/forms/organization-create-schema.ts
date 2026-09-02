import { z } from 'zod';
import { PRIORITY_VALUES } from '../types/organizationList';
import { ZOD, optionalNumber, optionalText } from './organization-summary-schema';

/**
 * Saisie d'un nouvel organisme — US-01-02.
 *
 * Les regles sont celles du serveur, a la lettre : seuls `name`, `type` et
 * `department` sont obligatoires. La V8 marque aussi « Ville » en requis ;
 * l'API ne l'exige pas, et refuser une saisie que le serveur accepterait
 * bloquerait une creation legitime — un EPCI n'a pas de ville.
 */
export const getOrganizationCreateSchema = () =>
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
      .refine(
        (v) => v === '' || /^\d{14}$/.test(v.replace(/\s/g, '')),
        ZOD.SIRET,
      ),
    inseeCode: optionalText(10),
    address: optionalText(),
    postalCode: optionalText(10),
    city: optionalText(120),
    epci: optionalText(),
    phone: optionalText(40),
    email: z.string().trim().email(ZOD.EMAIL).or(z.literal('')),

    population: optionalNumber,
    solution: z.string(),
    priority: z.enum(PRIORITY_VALUES),
  });

export type OrganizationCreateSchemaType = z.infer<
  ReturnType<typeof getOrganizationCreateSchema>
>;

/** Valeurs de depart, eventuellement pre-remplies par le registre. */
export const emptyOrganizationCreateValues = (
  prefill: Partial<OrganizationCreateSchemaType> = {},
): OrganizationCreateSchemaType => ({
  name: '',
  type: '',
  department: '',
  siret: '',
  inseeCode: '',
  address: '',
  postalCode: '',
  city: '',
  epci: '',
  phone: '',
  email: '',
  population: '',
  solution: '',
  priority: 'NORMAL',
  ...prefill,
});
