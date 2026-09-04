import type {
  OrganizationListParams,
  Priority,
  SalesStatus,
} from './organizationList';

/**
 * Actions groupees — L1 · US-01-05.
 *
 * « Agir sur plusieurs organismes a la fois. » L'appel est **partiel par
 * conception** : seules les fiches en acces `FULL` sont traitees, les autres
 * reviennent dans `skipped`. Il n'echoue jamais globalement.
 */
export const BULK_ACTIONS = [
  'ASSIGN_SALES_REP',
  'SET_SALES_STATUS',
  'SET_PRIORITY',
  'ADD_TO_CAMPAIGN',
  'DELETE',
] as const;
export type BulkAction = (typeof BULK_ACTIONS)[number];

/** Le champ que chaque action exige — un autre rend `400 INVALID_DATA`. */
export type BulkPayload = {
  salesRepId?: string;
  salesStatus?: SalesStatus;
  priority?: Priority;
  campaignId?: string;
};

/**
 * Les filtres rejoues cote serveur pour `selectAll`.
 *
 * Memes champs que `GET /organizations`, **sans** `page`, `limit`, `sort` ni
 * `order` : on designe un ensemble, pas une page.
 */
export type BulkFilters = Omit<
  OrganizationListParams,
  'page' | 'limit' | 'sort' | 'order'
>;

/**
 * Soit des identifiants, soit « tout ce qui correspond aux filtres ».
 *
 * Ni l'un ni l'autre rend `400`. Quand `selectAll` est vrai, `ids` est ignore
 * par le serveur.
 */
export type BulkRequest = {
  ids?: string[];
  selectAll?: boolean;
  filters?: BulkFilters;
  action: BulkAction;
  payload: BulkPayload;
};

/** Pourquoi une fiche n'a pas ete traitee. */
export const BULK_SKIP_REASONS = ['NOT_FOUND', 'OUT_OF_SCOPE'] as const;
export type BulkSkipReason = (typeof BULK_SKIP_REASONS)[number];

/**
 * `processed` compte les fiches traitees, **cas idempotents compris** :
 * re-cibler une fiche deja dans la campagne reste un succes.
 */
export type BulkResult = {
  processed: number;
  skipped: { id: string; reason: BulkSkipReason | string }[];
};

