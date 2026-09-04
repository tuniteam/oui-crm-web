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
  /**
   * Combien de creneaux chaque source porte sur la fenetre, **calcule avant
   * le filtre `kinds`** : une pastille qui tombe a zero quand on eteint son
   * calque ne dirait plus rien de ce qu'il y a derriere. Les sources des lots
   * L2 a L4 sont servies a zero d'ici la — un zero vrai, pas une absence.
   */
  counts: Record<AgendaKind, number>;
  meta: { total: number; page: number; limit: number; totalPages: number };
};

/** Etat d'un creneau, du point de vue de ce qu'il reste a faire. */
export const AGENDA_STATES = ['todo', 'late', 'done', 'all'] as const;
export type AgendaState = (typeof AGENDA_STATES)[number];

/**
 * Les quatre etats se calculent sur ce que le serveur rend deja — `status` et
 * `isLate` — car `GET /agenda` n'accepte **ni `status` ni `type`**. Filtrer
 * ici ne masque rien : la periode entiere est chargee avant d'etre peinte.
 *
 * Les annulees ne figurent jamais dans l'agenda : le serveur les exclut.
 * « Historique » ne montre donc que les realisees.
 */
export const AGENDA_STATE_MATCHES: Record<
  AgendaState,
  (item: AgendaItem) => boolean
> = {
  todo: (e) => e.status === 'PLANNED',
  late: (e) => e.isLate,
  done: (e) => e.status === 'DONE',
  all: () => true,
};

/** Limite dure du contrat, et defaut de la route. */
export const AGENDA_MAX_LIMIT = 100;

/**
 * Les six groupes de la vue Liste, dans l'ordre ou ils se lisent.
 *
 * Ce n'est pas un decoupage par jour mais par **urgence** : ce qui est en
 * retard d'abord, ce qui a eu lieu en dernier. C'est ce qui rend la liste
 * actionnable la ou la grille ne fait que situer.
 */
export const AGENDA_HORIZONS = [
  'late',
  'today',
  'week',
  'month',
  'later',
  'done',
] as const;
export type AgendaHorizon = (typeof AGENDA_HORIZONS)[number];
