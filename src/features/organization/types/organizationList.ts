import type { PaginationMeta } from '@/components/table/reusable-table';

/**
 * Organismes — `GET /organizations` (US-01-01, lot L1).
 *
 * Les valeurs d'enumeration sont celles du contrat ; leurs libelles viennent
 * de la maquette V8, dans le meme ordre (`STAT_COM`, `STAT_CLIENT`,
 * `PRIORITES`) — la correspondance est exacte, une valeur pour un libelle.
 */
export const SALES_STATUS_VALUES = [
  'NOT_CONTACTED',
  'TO_CONTACT',
  'IN_PROGRESS',
  'MEETING_SCHEDULED',
  'CLOSED',
] as const;
export type SalesStatus = (typeof SALES_STATUS_VALUES)[number];

export const CUSTOMER_STATUS_VALUES = [
  'NOT_CUSTOMER',
  'DEPLOYING',
  'ACTIVE',
  'SUSPENDED',
  'TERMINATED',
  'LOST_BEFORE_GOLIVE',
] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUS_VALUES)[number];

export const PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH'] as const;
export type Priority = (typeof PRIORITY_VALUES)[number];

/**
 * Portee geographique de la fiche pour l'utilisateur courant.
 *
 * `NONE` n'existe pas ici : une fiche hors perimetre avec un role sans acces
 * n'apparait pas en liste et repond 404 en detail — son existence n'est jamais
 * revelee, le front n'a donc pas ce cas a traiter.
 */
export type OrganizationAccess = 'FULL' | 'RESTRICTED';

export type OrganizationSalesRep = {
  id: string;
  fullName: string;
};

export type OrganizationCompleteness = {
  score: number;
  missing: string[];
  /** Present en detail. `quote` peut valoir null : voir la note du service. */
  blocks?: { quote: boolean | null; contract: boolean | null };
};

/**
 * Ligne de liste.
 *
 * Sur `access: "RESTRICTED"` le serveur ne rend que neuf champs — id, nom,
 * type, ville, departement, les deux statuts, le commercial et l'acces. Tout
 * le reste est donc optionnel : ne jamais le lire sans verifier l'acces.
 */
export type OrganizationListItem = {
  id: string;
  name: string;
  /** Cle de referentiel `STRUCTURE_TYPE`, jamais un libelle. */
  type: string;
  city: string | null;
  department: string;
  salesStatus: SalesStatus;
  customerStatus: CustomerStatus;
  salesRep: OrganizationSalesRep | null;
  access: OrganizationAccess;

  population?: number | null;
  /** Strate tarifaire, calculee par l'API d'apres la grille active du projet.
   *  Jamais recalculee cote front : les grilles sont par projet et versionnees. */
  bracketLabel?: string | null;
  priority?: Priority;
  tags?: string[];
  solution?: { key: string } | null;
  lastActivityAt?: string | null;
  nextActivityAt?: string | null;
  completeness?: OrganizationCompleteness;
};

export type OrganizationListResponse = {
  data: OrganizationListItem[];
  meta: PaginationMeta;
};

/** Tri accepte par l'API. `type` et `solution` n'en font pas partie, bien que
 *  la V8 rende leurs en-tetes cliquables. */
export const ORGANIZATION_SORT_VALUES = [
  'name',
  'city',
  'department',
  'population',
  'salesStatus',
  'customerStatus',
  'priority',
  'completenessScore',
  'lastActivityAt',
  'nextActivityAt',
  'createdAt',
] as const;
export type OrganizationSort = (typeof ORGANIZATION_SORT_VALUES)[number];

export type OrganizationListParams = {
  page?: number;
  limit?: number;
  /** Nom ou ville ; une saisie numerique cherche aussi le debut du SIRET.
   *  Ni le code postal ni les contacts — verifie contre l'API. */
  search?: string;
  type?: string;
  department?: string;
  region?: string;
  salesStatus?: SalesStatus;
  customerStatus?: CustomerStatus;
  priority?: Priority;
  tag?: string;
  solution?: string;
  salesRepId?: string;
  leadSource?: string;
  /** Inclusif. `99` = le compteur « fiches incompletes » de la V8. */
  completenessMax?: number;
  sort?: OrganizationSort;
  order?: 'asc' | 'desc';
};
