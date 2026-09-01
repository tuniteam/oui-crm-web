import { z } from 'zod';
import { SETTINGS_ZOD } from '../constants/constants';

const MAX = 150;

/**
 * Le serveur accepte la chaine vide : elle efface le champ. Aucun champ
 * societe n'est donc obligatoire, seuls les formats sont contraints.
 */
const optionalText = z.string().max(MAX, SETTINGS_ZOD.MAX_150);

export const companySchema = z.object({
  name: optionalText,
  siren: optionalText.refine(
    (v) => v === '' || /^\d{9}$/.test(v.replace(/\s/g, '')),
    SETTINGS_ZOD.SIREN,
  ),
  siret: optionalText.refine(
    (v) => v === '' || /^\d{14}$/.test(v.replace(/\s/g, '')),
    SETTINGS_ZOD.SIRET,
  ),
  rcs: optionalText,
  address: optionalText,
  phone: optionalText,
  email: optionalText.refine(
    (v) => v === '' || z.string().email().safeParse(v).success,
    SETTINGS_ZOD.INVALID_EMAIL,
  ),
  signatory: optionalText,
});

export type CompanySchema = z.infer<typeof companySchema>;
