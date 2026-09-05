import {
  CUSTOMER_STATUS_LABELS,
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '@/features/organization/constants/organizationList.constants';
import type {
  CustomerStatus,
  Priority,
  SalesStatus,
} from '@/features/organization/types/organizationList';
import type { ReferenceCategory } from '@/features/settings/types/reference-items';

/**
 * Le nom francais de chaque critere de ciblage.
 *
 * `criteria` est un `Record` libre au contrat, mais ses cles sont **celles des
 * filtres de `GET /organizations`** : la campagne rejoue la requete qui a
 * constitue sa cible. On les nomme donc a partir de cette liste, jamais d'une
 * devinette — une cle inconnue reste affichee telle quelle.
 */
const CRITERIA_LABELS: Record<string, string> = {
  search: 'Recherche',
  type: 'Type',
  department: 'Département',
  region: 'Région',
  salesStatus: 'Statut commercial',
  customerStatus: 'Statut client',
  priority: 'Priorité',
  tag: 'Étiquette',
  solution: 'Solution en place',
  salesRepId: 'Commercial',
  leadSource: 'Origine',
  completenessMax: 'Complétude au plus',
};

/**
 * Les criteres dont la **valeur** est elle aussi une cle : soit une enumeration
 * du contrat, soit un referentiel de projet. Les autres — une recherche, un
 * numero de departement — se lisent telles quelles.
 */
const VALUE_REFERENCE: Record<string, ReferenceCategory> = {
  type: 'STRUCTURE_TYPE',
  tag: 'TAG',
  solution: 'SOLUTION',
  leadSource: 'LEAD_SOURCE',
};

type LabelOf = (category: ReferenceCategory, key: string) => string | null;

/** Une valeur de critere, en francais quand elle en a un. */
function valueLabel(key: string, value: unknown, labelOf: LabelOf): string {
  const raw = String(value);
  if (key === 'salesStatus') return SALES_STATUS_LABELS[raw as SalesStatus] ?? raw;
  if (key === 'customerStatus')
    return CUSTOMER_STATUS_LABELS[raw as CustomerStatus] ?? raw;
  if (key === 'priority') return PRIORITY_LABELS[raw as Priority] ?? raw;
  const category = VALUE_REFERENCE[key];
  return category ? (labelOf(category, raw) ?? raw) : raw;
}

/**
 * « Département 89 · Statut commercial En cours de prospection », plutot que
 * « department = 89 · salesStatus = IN_PROGRESS ».
 *
 * Voir la regle « Aucune cle de referentiel a l'ecran » du skill
 * `front-gap-analysis` : une chaine en MAJUSCULES_UNDERSCORE affichee a
 * l'utilisateur est toujours un defaut.
 */
export function describeCriteria(
  criteria: Record<string, unknown> | null | undefined,
  labelOf: LabelOf,
): string | null {
  if (!criteria) return null;
  const parts = Object.entries(criteria)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(
      ([k, v]) =>
        `${CRITERIA_LABELS[k] ?? k} : ${valueLabel(k, v, labelOf)}`,
    );
  return parts.length ? parts.join(' · ') : null;
}
