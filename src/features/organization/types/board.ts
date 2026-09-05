import type { Priority, SalesStatus } from './organizationList';

/**
 * Tableau de prospection — L1 · US-01-10.
 *
 * Les cinq statuts commerciaux en colonnes, et le deplacement manuel qui
 * converge avec les automatismes d'actions sur le meme writer.
 */

/** L'ordre du pipeline, celui que le serveur rend. */
export const BOARD_COLUMNS: SalesStatus[] = [
  'NOT_CONTACTED',
  'TO_CONTACT',
  'IN_PROGRESS',
  'MEETING_SCHEDULED',
  'CLOSED',
];

/**
 * La prochaine action de la fiche — celle qui donne `nextActivityAt` et qui
 * trie la colonne.
 *
 * `title` est le **libelle resolu depuis le referentiel du projet**, pas la
 * cle : un projet qui renomme ses types voit ses propres mots. `date` et
 * `time` sont des chaines brutes, jamais des instants — les afficher telles
 * quelles evite le decalage de fuseau.
 */
export type BoardNextActivity = {
  id: string;
  /** Cle du referentiel `ACTIVITY_TYPE`, pour le code. */
  type: string;
  /** Libelle du type, pour l'ecran. */
  title: string;
  /** Jour `YYYY-MM-DD`. */
  date: string;
  /** Heure locale `HH:MM`, ou `null` pour une tache sans heure. */
  time: string | null;
};

/**
 * Une carte.
 *
 * Hors du perimetre de l'appelant avec un role `RESTRICTED`, la carte est
 * **reduite** : seuls `id`, `name`, `salesRep` et `access` sont presents —
 * ni priorite, ni etiquettes, ni dates, ni prochaine action. Le serveur ne
 * renseigne pas sur l'activite d'un confrere par la bande, et le front
 * desactive son deplacement.
 */
export type BoardCard = {
  id: string;
  name: string;
  salesRep: { id: string; fullName: string; initials: string | null } | null;
  access: 'FULL' | 'RESTRICTED';
  priority?: Priority;
  tags?: string[];
  nextActivityAt?: string | null;
  nextActivity?: BoardNextActivity | null;
  lastActivityAt?: string | null;
};

/**
 * Une colonne, avec **sa propre pagination**.
 *
 * `meta.total` est sa taille reelle ; `meta.page < meta.totalPages` dit qu'il
 * reste des cartes. On les demande avec `salesStatus` + `page`, ce qui deroule
 * une colonne sans recharger les quatre autres.
 */
export type BoardColumn = {
  salesStatus: SalesStatus;
  meta: { total: number; page: number; limit: number; totalPages: number };
  items: BoardCard[];
};

export type BoardResponse = { columns: BoardColumn[] };

/**
 * Cartes demandees par colonne et par page.
 *
 * Le serveur en rend cinquante par defaut et cent au maximum ; on demande
 * **vingt**. Cinq colonnes de cinquante font deux cent cinquante cartes a
 * peindre pour un ecran qui n'en montre qu'une dizaine a la fois, et « Charger
 * la suite » est la pour le reste.
 *
 * La valeur est passee explicitement aux deux appels — le chargement initial
 * et la suite — pour que le calcul de page repose sur la meme base.
 */
export const BOARD_PAGE_SIZE = 20;

export type SalesStatusPayload = {
  salesStatus: SalesStatus;
  /** Journalise. Au plus 500 caracteres. */
  reason?: string;
};
