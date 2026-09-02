import type {
  CustomerStatus,
  OrganizationAccess,
  OrganizationCompleteness,
  OrganizationSalesRep,
  Priority,
  SalesStatus,
} from './organizationList';

/** Valeur de referentiel telle que **lue** : un objet portant la cle. */
export type ReferenceRef = { key: string };

/**
 * `GET /organizations/:id` (US-01-03) — la ligne de liste, plus l'adresse,
 * l'environnement periscolaire, les affectations et les compteurs.
 *
 * Sur `access: "RESTRICTED"` le serveur ne rend que la projection a neuf
 * champs : tout le reste est optionnel ici. Sur `NONE` il repond `404`, jamais
 * `403` — l'existence d'une fiche hors perimetre n'est jamais revelee, le
 * front n'a donc pas ce cas a distinguer d'une fiche inconnue.
 */
export type OrganizationDetail = {
  id: string;
  name: string;
  type: string;
  city: string | null;
  department: string;
  salesStatus: SalesStatus;
  customerStatus: CustomerStatus;
  salesRep: OrganizationSalesRep | null;
  access: OrganizationAccess;

  displayPrefix?: string | null;
  siret?: string | null;
  siren?: string | null;
  inseeCode?: string | null;
  address?: string | null;
  postalCode?: string | null;
  /** Derivee du departement a la lecture. Ne jamais l'envoyer en ecriture. */
  region?: string | null;
  epci?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;

  population?: number | null;
  /** Strate tarifaire de la grille active du projet. Calculee par l'API. */
  bracketLabel?: string | null;
  schoolCount?: number | null;
  childCount?: number | null;

  solution?: ReferenceRef | null;
  leadSource?: ReferenceRef | null;
  services?: ReferenceRef[];
  tags?: string[];
  targetPlan?: string | null;
  goLiveTarget?: string | null;
  priority?: Priority;

  consultant?: OrganizationSalesRep | null;
  trainer?: OrganizationSalesRep | null;

  notes?: string | null;
  completeness?: OrganizationCompleteness;
  counts?: { contacts: number; activities: number };
  createdAt?: string;
  updatedAt?: string;
};

/**
 * `PATCH /organizations/:id` — tous les champs optionnels.
 *
 * Deux ecarts avec la lecture, verifies contre l'API :
 *
 * - **Les referentiels s'ecrivent en chaines**, pas en objets. La lecture rend
 *   `solution: { key }` et `services: [{ key }]` ; renvoyer cette forme donne
 *   « solution must be a string ». D'ou `toUpdatePayload`.
 * - **`salesStatus` et `customerStatus` sont refuses** (« property … should not
 *   exist »). Le statut commercial passe par `POST /organizations/:id/
 *   sales-status` (US-01-10), le statut client par les lots suivants. Ils ne
 *   figurent donc pas ici : les exposer en formulaire ferait echouer tout
 *   l'enregistrement, pas seulement le champ.
 *
 * `region` et `bracketLabel` sont derives et absents pour la meme raison.
 */
export type UpdateOrganizationPayload = {
  name?: string;
  type?: string;
  department?: string;
  displayPrefix?: string | null;
  siret?: string | null;
  siren?: string | null;
  inseeCode?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  population?: number | null;
  epci?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  solution?: string | null;
  schoolCount?: number | null;
  childCount?: number | null;
  services?: string[];
  priority?: Priority;
  tags?: string[];
  leadSource?: string | null;
  targetPlan?: string | null;
  salesRepId?: string | null;
  consultantId?: string | null;
  trainerId?: string | null;
  notes?: string | null;
  goLiveTarget?: string | null;
};

/** Cle d'un referentiel lu, ou `null`. */
export const refKey = (ref?: ReferenceRef | null): string | null =>
  ref?.key ?? null;

/** Cles d'une liste de referentiels lue. */
export const refKeys = (refs?: ReferenceRef[] | null): string[] =>
  (refs ?? []).map((r) => r.key);
