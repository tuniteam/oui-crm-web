/**
 * Campagnes — L1 · US-01-11.
 *
 * « Un ciblage nomme, date et mesure. » La cible est **figee** : `criteria` dit
 * comment elle a ete construite, il ne la reconstruit pas. Modifier les
 * criteres ne change pas la liste.
 */

import type { SalesStatus } from '@/features/organization/types/organizationList';

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

/**
 * Compte rendu d'un ajout a la cible.
 *
 * L'appel **n'echoue jamais globalement** sur une selection partielle : les
 * trois nombres sont a rendre tous les trois. `alreadyIn` n'est pas une erreur
 * — l'ajout est idempotent — et `skipped` regroupe les fiches inconnues,
 * supprimees, ou hors du perimetre geographique de l'appelant.
 */
export type CampaignTargetReport = {
  added: number;
  alreadyIn: number;
  skipped: number;
};

/** Limite dure du contrat : 500 identifiants par appel. */
export const CAMPAIGN_TARGET_MAX_IDS = 500;

/**
 * Une ligne du detail par organisme cible.
 *
 * `GET /campaigns/:id/results` n'est **pas paginee** : elle rend toute la
 * cible. Elle ne porte pas non plus d'`access` — contrairement a
 * `GET /campaigns/:id/organizations` — donc pas de badge « hors perimetre »
 * ici.
 */
export type CampaignResultRow = {
  organizationId: string;
  name: string;
  salesStatus: SalesStatus;
  /** Actions **de cette campagne** sur cette fiche, pas son historique. */
  activities: number;
  /** Horodatage ISO complet, ou `null` si la fiche n'a rien produit. */
  lastActivityAt: string | null;
};

/**
 * `totals` porte les memes quatre compteurs que la carte, et vaut par
 * construction la somme des lignes : ne jamais les additionner soi-meme, une
 * fiche supprimee sortirait des lignes sans sortir du total.
 */
export type CampaignResultsResponse = {
  totals: CampaignResults;
  data: CampaignResultRow[];
};

/**
 * Un perimetre qui bloque la suppression d'une campagne.
 *
 * `409 CAMPAIGN_IN_USE_BY_SCOPE` les nomme dans `messages.meta.scopes`. Le
 * front **guide** la dissociation, il ne la fait pas dans le dos de
 * l'administrateur : un perimetre est du controle d'acces.
 */
export type BlockingScope = { id: string; name: string };
