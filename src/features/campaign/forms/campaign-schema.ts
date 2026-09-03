import { z } from 'zod';
import type { Campaign } from '../types/campaign';

const ZOD = {
  REQUIRED: 'Champ requis',
  MAX: 'Longueur maximale dépassée',
  DATE: 'Date invalide (AAAA-MM-JJ)',
  PERIOD: 'La fin doit suivre le début',
};

/** Jour calendaire, la forme que le serveur attend. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Saisie d'une campagne — L1 · US-01-11.
 *
 * Longueurs relevees dans `campaigns.constants.ts` de l'API, pas devinees :
 * nom 150, description 1000.
 */
const MAX = { NAME: 150, DESCRIPTION: 1000 } as const;

export const getCampaignSchema = () =>
  z
    .object({
      name: z.string().trim().min(1, ZOD.REQUIRED).max(MAX.NAME, ZOD.MAX),
      description: z.string().trim().max(MAX.DESCRIPTION, ZOD.MAX),
      startDate: z.string().trim().regex(DAY, ZOD.DATE).or(z.literal('')),
      endDate: z.string().trim().regex(DAY, ZOD.DATE).or(z.literal('')),
    })
    // Le serveur refuse une periode inversee (`400 INVALID_DATA`) : on le dit
    // avant l'envoi, sous le champ concerne.
    .refine((v) => !v.startDate || !v.endDate || v.startDate <= v.endDate, {
      path: ['endDate'],
      message: ZOD.PERIOD,
    });

export type CampaignSchemaType = z.infer<ReturnType<typeof getCampaignSchema>>;

export const emptyCampaignValues = (): CampaignSchemaType => ({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
});

export const toCampaignFormValues = (c: Campaign): CampaignSchemaType => ({
  name: c.name,
  description: c.description ?? '',
  startDate: c.startDate ?? '',
  endDate: c.endDate ?? '',
});
