/** Tableau de prospection — L1 · US-01-10. Routes scopées projet. */
export const BOARD_ROUTES = {
  BOARD_API: '/organizations/board',
  SALES_STATUS_API: (id: string) => `/organizations/${id}/sales-status`,
} as const;

/** Codes d'erreur routés par l'écran. */
export const BOARD_ERRORS = {
  /** Dépôt sur la colonne actuelle — le seul mouvement refusé. */
  INVALID_TRANSITION: 'ORGANIZATION_INVALID_TRANSITION',
} as const;

export const BOARD_UI = {
  TITLE: 'Suivi prospection',
  SUBTITLE:
    'Les organismes engagés, classés par statut commercial. Déplacez une carte pour changer son statut.',

  /**
   * Ce que chaque colonne veut dire, en une phrase.
   *
   * Un titre de statut ne dit pas ce qu'on attend de l'utilisateur ; la
   * maquette V8 met cette définition sous chaque colonne, et elle a raison.
   */
  COLUMN_HINTS: {
    NOT_CONTACTED: 'Jamais approchés.',
    TO_CONTACT: 'Entrés dans le pipeline, pas encore travaillés.',
    IN_PROGRESS: 'Le dialogue est engagé.',
    MEETING_SCHEDULED: 'Un rendez-vous est posé.',
    CLOSED: 'Abandonnés. Le réveil est manuel.',
  },

  /**
   * « Non contacté » est masquée, comme dans la V8 : le tableau sert à faire
   * avancer ce qui est engagé. Sur une base importée cette colonne compte des
   * milliers de fiches et écraserait les quatre autres — on dit combien y
   * dorment, et on renvoie à la liste pour les travailler.
   */
  HIDDEN_COLUMN: (n: number) =>
    n === 0
      ? 'Aucune fiche jamais approchée.'
      : `${n} fiche${n > 1 ? 's' : ''} jamais approchée${n > 1 ? 's' : ''} — à travailler depuis la liste des organismes.`,
  HIDDEN_COLUMN_LINK: 'Ouvrir la liste',

  /**
   * Une colonne se déroule sans recharger les quatre autres.
   *
   * Le compte vient **avant** l'action : on lit où l'on en est — trois cartes
   * affichées sur dix — puis on décide d'en charger la suite.
   */
  LOAD_MORE: (shown: number, total: number) =>
    `${shown} sur ${total} — Charger la suite`,
  LOADING_MORE: 'Chargement…',

  /** Une carte hors périmètre reste visible, réduite et non déplaçable. */
  RESTRICTED: 'Hors de votre périmètre',
  UNASSIGNED: 'Non affectée',
  /**
   * L'absence se dit **en retrait**.
   *
   * Deux fiches sur dix ont une action planifiée : mettre « Aucune action
   * planifiée » en tête de carte, dans la même fonte que les dates, ferait
   * crier le silence sur huit cartes et noierait les deux qui parlent. La
   * phrase reste, plus courte et plus discrète.
   */
  NO_NEXT_ACTIVITY: 'rien de planifié',
  LATE: (days: number) => `en retard de ${days} j`,

  /** Une pastille de deux lettres remplace un nom : le survol le rend. */
  TAG_TOOLTIP: (tag: string) => `Étiquette : ${tag}`,

  EMPTY_COLUMN: 'Aucun organisme',

  EMPTY: {
    TITLE: 'Rien à suivre',
    DESCRIPTION:
      'Aucun organisme n’est encore entré dans le pipeline. Faites-en entrer un depuis la liste des organismes.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger le tableau',
    /** L'écran a divergé : on recharge plutôt que de laisser la carte mentir. */
    INVALID_TRANSITION:
      'Cette carte est déjà dans cette colonne. Le tableau a été rechargé.',
  },

  MOVED: (status: string) => `Déplacée vers « ${status} »`,
} as const;

/**
 * Le motif d'un abandon — L1 · US-01-10.
 *
 * `reason` est facultatif au contrat et part au journal. Le demander à chaque
 * déplacement alourdirait le geste ; ne jamais le proposer priverait le
 * journal de ce qui explique un abandon. On le demande donc au seul passage à
 * « Clôturé ».
 */
export const BOARD_CLOSE_WINDOW = {
  TITLE: 'Clôturer le suivi',
  DESCRIPTION: (name: string) =>
    `« ${name} » sort du pipeline. Le réveil sera manuel : aucun retour automatique n’est prévu.`,
  FIELD: 'Motif',
  PLACEHOLDER: 'Budget reporté, solution concurrente retenue…',
  HINT: 'Facultatif, mais il restera au journal — c’est ce qui expliquera l’abandon dans six mois.',
  MAX: 500,

  ACTIONS: {
    CONFIRM: 'Clôturer',
    CANCEL: 'Annuler',
  },
} as const;
