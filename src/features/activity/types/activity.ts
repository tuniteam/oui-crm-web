/**
 * Actions commerciales — L1 · US-01-08.
 *
 * « Planifier, realiser, annuler. » Une action nait toujours `PLANNED` :
 * la realiser passe par une route dediee, ou le compte rendu est obligatoire
 * — c'est lui qui rend l'action reelle.
 */

/** Trois etats, pas deux : realisee et annulee sont distinctes. */
export const ACTIVITY_STATUSES = ['PLANNED', 'DONE', 'CANCELLED'] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export type ActivityRef = { id: string; name: string };

export type ActivityUser = {
  id: string;
  fullName: string;
  /** **Peut etre nul** : l'exemple du handoff le montre rempli, la base non. */
  initials: string | null;
};

/** Cle et libelle du referentiel `ACTIVITY_TYPE`, resolus par le serveur. */
/**
 * Valeur de referentiel resolue par l'API : la cle pour le code, le libelle
 * pour l'ecran. `type` et `result` ont la meme forme — le handoff ne montre
 * `result` qu'a `null`, sa forme a ete relevee sur l'API en marche.
 */
export type ActivityReference = { key: string; label: string };

/** @deprecated Alias historique, garde pour ne pas casser les imports. */
export type ActivityType = ActivityReference;

export type Activity = {
  id: string;
  organization: ActivityRef;
  contact: { id: string; fullName: string } | null;
  user: ActivityUser;
  type: ActivityReference;
  /** Jour calendaire `YYYY-MM-DD`. */
  date: string;
  /**
   * Heure locale `HH:MM`, **affichee telle quelle**. La convertir decalerait
   * tous les rendez-vous d'un fuseau : la chaine se transporte, elle ne se
   * reconstruit pas en `Date`.
   */
  time: string | null;
  durationMin: number | null;
  location: string | null;
  status: ActivityStatus;
  report: string | null;
  result: ActivityReference | null;
  campaign: ActivityRef | null;
  completedAt: string | null;
};

export type ActivityListParams = {
  organizationId?: string;
  userId?: string;
  status?: ActivityStatus;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type ActivityListResponse = {
  data: Activity[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type CreateActivityPayload = {
  organizationId: string;
  contactId?: string;
  type: string;
  date: string;
  time?: string;
  durationMin?: number;
  location?: string;
  report?: string;
  campaignId?: string;
};

/**
 * Re-planification, **`PLANNED` uniquement**. Une action close est de
 * l'histoire : le serveur rend `409 ACTIVITY_ALREADY_CLOSED`.
 */
export type UpdateActivityPayload = {
  contactId?: string | null;
  type?: string;
  date?: string;
  time?: string | null;
  durationMin?: number | null;
  location?: string | null;
  report?: string | null;
  campaignId?: string | null;
};

/** Le compte rendu est **obligatoire** : il est ce qui rend l'action reelle. */
export type CompleteActivityPayload = {
  report: string;
  result?: string;
  completedAt?: string;
};

/** Limites lues dans les validateurs de l'API, absentes du handoff. */
export const ACTIVITY_LIMITS = {
  TYPE: 60,
  RESULT: 60,
  LOCATION: 255,
  REPORT: 4000,
  DURATION_MIN: 1,
  DURATION_MAX: 24 * 60,
} as const;
