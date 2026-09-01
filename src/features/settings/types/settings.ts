/** Etapes d'opportunite portant une probabilite. Toujours les 7. */
export const STAGE_VALUES = [
  'QUALIFICATION',
  'DEMONSTRATION',
  'QUOTE_SENT',
  'NEGOTIATING',
  'VERBAL_AGREEMENT',
  'WON',
  'LOST',
] as const;

export type Stage = (typeof STAGE_VALUES)[number];

export const STAGE = {
  QUALIFICATION: STAGE_VALUES[0],
  DEMONSTRATION: STAGE_VALUES[1],
  QUOTE_SENT: STAGE_VALUES[2],
  NEGOTIATING: STAGE_VALUES[3],
  VERBAL_AGREEMENT: STAGE_VALUES[4],
  WON: STAGE_VALUES[5],
  LOST: STAGE_VALUES[6],
} as const;

/** WON et LOST sont figees cote serveur : 400 STAGE_PROBABILITY_FIXED sinon. */
export const FIXED_STAGE_PROBABILITIES: Partial<Record<Stage, number>> = {
  [STAGE.WON]: 100,
  [STAGE.LOST]: 0,
};

export type StageProbabilities = Record<Stage, number>;

/** Les 8 champs sont toujours presents ; chaine vide = non renseigne. */
export type CompanySettings = {
  name: string;
  siren: string;
  siret: string;
  rcs: string;
  address: string;
  phone: string;
  email: string;
  signatory: string;
};

export type SettingsResponse = {
  vatRate: number;
  revenueTarget: number;
  meetingTarget: number;
  quoteValidityDays: number;
  noticeMonths: number;
  defaultCommitmentMonths: number;
  discountCap: number;
  retentionMonths: number;
  stageProbabilities: StageProbabilities;
  company: CompanySettings;
  updatedAt: string;
};

/**
 * PATCH partiel. `company` et `stageProbabilities` fusionnent cle par cle :
 * n'envoyer que ce qui change. `null` est refuse partout.
 */
export type UpdateSettingsPayload = Partial<
  Omit<SettingsResponse, 'stageProbabilities' | 'company' | 'updatedAt'>
> & {
  stageProbabilities?: Partial<StageProbabilities>;
  company?: Partial<CompanySettings>;
};
