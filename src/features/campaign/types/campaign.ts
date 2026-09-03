/**
 * Campagnes — L1 · US-01-11.
 *
 * « Un ciblage nomme, date et mesure. » La cible est **figee** : `criteria` dit
 * comment elle a ete construite, il ne la reconstruit pas. Modifier les
 * criteres ne change pas la liste.
 */

export const CAMPAIGN_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

/**
 * Transitions permises par le serveur.
 *
 * `DRAFT → ACTIVE → CLOSED`, et une campagne close se **rouvre**. Tout autre
 * mouvement, **le statut identique compris**, rend
 * `409 INVALID_STATUS_TRANSITION` : l'ecran ne propose donc que celles-ci
 * plutot que d'offrir les trois statuts et de traduire un refus.
 */
export const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['CLOSED'],
  CLOSED: ['ACTIVE'],
};

export type CampaignOwner = {
  id: string;
  fullName: string;
  initials: string;
};

/**
 * Compteurs calcules **a la demande**, jamais stockes.
 *
 * Au L1, seul `activities` est alimente : les trois autres restent a zero, et
 * le contrat ne changera pas quand le L2 les remplira. Les afficher a zero est
 * donc correct ; les masquer priverait l'ecran de sa promesse.
 */
export type CampaignResults = {
  activities: number;
  opportunities: number;
  quotes: number;
  signed: number;
};

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  owner: CampaignOwner | null;
  /** Jours calendaires `YYYY-MM-DD`, ou `null`. */
  startDate: string | null;
  endDate: string | null;
  /** Documentaire : comment la cible a ete construite, pas un filtre actif. */
  criteria: Record<string, unknown> | null;
  organizationsCount: number;
  results: CampaignResults;
};

export type CampaignListParams = {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
};

export type CampaignListResponse = {
  data: Campaign[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type CreateCampaignPayload = {
  name: string;
  description?: string;
  criteria?: Record<string, unknown>;
  ownerId?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * Modification : `description`, `ownerId`, `startDate` et `endDate` s'effacent
 * par `null` ; le nom jamais. Un corps vide est refuse
 * (`400 EMPTY_UPDATE_PAYLOAD`).
 */
export type UpdateCampaignPayload = {
  name?: string;
  description?: string | null;
  criteria?: Record<string, unknown>;
  ownerId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};
