/**
 * Agenda — L1 · US-01-09.
 *
 * Une vue unique sur quatre sources. **Seule `ACTIVITY` repond au L1** ; les
 * trois autres arrivent aux lots L2 a L4, sans changement de contrat.
 */

export const AGENDA_KINDS = [
  'ACTIVITY',
  'TRAINING',
  'CONTRACT_END',
  'QUOTE_EXPIRY',
] as const;
export type AgendaKind = (typeof AGENDA_KINDS)[number];

export type AgendaItem = {
  kind: AgendaKind;
  id: string;
  /** Jour calendaire `YYYY-MM-DD`, lu tel quel. */
  date: string;
  /** Heure locale `HH:MM`, **jamais convertie**. */
  time: string | null;
  /** Ce qu'est le creneau — le libelle du type, pas sa cle. */
  title: string;
  subtitle: string | null;
  organization: { id: string; name: string };
  user: { id: string; fullName: string; initials: string | null } | null;
  status: string;
  /**
   * Planifiee a une date passee. **Rendu par le serveur**, jamais recalcule :
   * un calcul local divergerait d'un fuseau, et c'est le seul signal d'alerte
   * de l'ecran.
   */
  isLate: boolean;
};

/**
 * `from` et `to` sont **obligatoires** : une requete par periode affichee.
 *
 * `limit` vaut le maximum par defaut (100) — une periode se charge normalement
 * d'un coup. `meta` reste rendu, et une periode chargee se pagine au lieu
 * d'etre tronquee en silence.
 */
export type AgendaParams = {
  from: string;
  to: string;
  userId?: string;
  kinds?: string;
  page?: number;
  limit?: number;
};

export type AgendaResponse = {
  data: AgendaItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Limite dure du contrat, et defaut de la route. */
export const AGENDA_MAX_LIMIT = 100;
