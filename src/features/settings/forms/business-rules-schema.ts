import { z } from 'zod';
import { SETTINGS_ZOD } from '../constants/constants';

const intPositive = z
  .number({ message: SETTINGS_ZOD.INTEGER_POSITIVE })
  .int(SETTINGS_ZOD.INTEGER_POSITIVE)
  .min(0, SETTINGS_ZOD.INTEGER_POSITIVE);

const percent = z
  .number({ message: SETTINGS_ZOD.RANGE_0_100 })
  .min(0, SETTINGS_ZOD.RANGE_0_100)
  .max(100, SETTINGS_ZOD.RANGE_0_100);

export const businessRulesSchema = z.object({
  // 2 decimales autorisees, contrairement aux autres pourcentages.
  vatRate: percent,
  discountCap: percent.int(SETTINGS_ZOD.INTEGER_POSITIVE),
  revenueTarget: intPositive,
  meetingTarget: intPositive,
  quoteValidityDays: z
    .number({ message: SETTINGS_ZOD.MIN_1 })
    .int(SETTINGS_ZOD.INTEGER_POSITIVE)
    .min(1, SETTINGS_ZOD.MIN_1),
  noticeMonths: intPositive,
  defaultCommitmentMonths: intPositive,
  retentionMonths: intPositive,
  // Les 7 etapes, WON et LOST comprises (figees, rendues en lecture seule).
  stageProbabilities: z.record(
    z.string(),
    percent.int(SETTINGS_ZOD.RANGE_0_100),
  ),
});

export type BusinessRulesSchema = z.infer<typeof businessRulesSchema>;
