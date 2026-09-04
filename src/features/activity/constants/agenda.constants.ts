import type { Tone } from '@/shared/constants/tone';
import type { AgendaHorizon } from '../types/agenda';
/** Agenda — L1 · US-01-09. Route scopée projet. */
export const AGENDA_ROUTES = {
  AGENDA_API: '/agenda',
} as const;

/** Les deux vues livrées. Jour et semaine de la V8 attendent un usage réel. */
export const AGENDA_VIEWS = ['month', 'list'] as const;
export type AgendaView = (typeof AGENDA_VIEWS)[number];

export const AGENDA_UI = {
  TITLE: 'Agenda',
  SUBTITLE:
    'Ce qui est planifié, et ce qui aurait dû l’être. Les actions viennent des fiches organismes.',

  VIEWS: {
    month: 'Mois',
    list: 'Liste',
  } satisfies Record<AgendaView, string>,

  ADD: 'Enregistrer une action',
  TODAY: 'Aujourd’hui',
  PREVIOUS: 'Mois précédent',
  NEXT: 'Mois suivant',

  WEEKDAYS: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],

  FILTERS: {
    USER: 'Collaborateur',
    /** Visible seulement hors portée `OWN` : voir le commentaire de l'écran. */
    USER_ALL: 'Tous les collaborateurs',
    TYPE_ALL: 'Tous les types',
  },

  /**
   * Les quatre états de la V8. Ils se calculent côté navigateur : la route
   * n'accepte ni `status` ni `type`, et la période entière est chargée.
   *
   * « À faire » par défaut — c'est la question que l'écran doit servir. Les
   * annulées ne figurent jamais dans l'agenda, le serveur les exclut : donc
   * « Historique » ne montre que les réalisées.
   */
  STATES: {
    todo: 'À faire',
    late: 'En retard',
    done: 'Historique',
    all: 'Tout',
  },

  /**
   * Les quatre sources, avec leur compte réel rendu par `counts`. Trois sont à
   * zéro jusqu'aux lots L2 à L4 — un zéro **vrai**, pas une absence, et c'est
   * ce qui les distingue d'un filtre inerte.
   */
  SOURCES: {
    ACTIVITY: 'Actions',
    TRAINING: 'Formations',
    CONTRACT_END: 'Échéances de contrat',
    QUOTE_EXPIRY: 'Fins de devis',
  },
  SOURCE_PENDING: 'à partir d’un prochain lot',
  /**
   * Deux nombres quand un filtre est actif : ce qu'on voit, et ce que la
   * période contient. Un total seul au-dessus d'une liste plus courte se lit
   * comme un chiffre périmé ; le total seul reste juste quand rien n'est
   * filtré.
   */
  SOURCE_COUNT: (shown: number, total: number) =>
    shown === total ? `${total}` : `${shown} sur ${total}`,

  /** `isLate` vient du serveur : le seul signal d'alerte de l'écran. */
  LATE: 'En retard',
  MORE: (n: number) => `+${n}`,

  EMPTY: {
    TITLE: 'Rien de planifié',
    DESCRIPTION:
      'Planifiez une action depuis la fiche d’un organisme : elle apparaîtra ici.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger l’agenda',
  },
} as const;

/**
 * Le bandeau d'alerte — L1 · US-01-09.
 *
 * Il ne s'affiche que s'il y a quelque chose qui presse : un bandeau permanent
 * cesse d'être un signal.
 */
export const AGENDA_BANNER = {
  SUMMARY: (late: number, today: number) =>
    [
      late > 0 ? `${late} action${late > 1 ? 's' : ''} en retard` : '',
      today > 0 ? `${today} aujourd’hui` : '',
    ]
      .filter(Boolean)
      .join(' · '),

  LINE: (
    time: string | null,
    title: string,
    organization: string,
    lateDays: number | null,
  ) =>
    [
      time ? `${time} · ` : '',
      `${title} · ${organization}`,
      lateDays !== null ? ` (${lateDays} j)` : '',
    ].join(''),

  SEE_ALL: 'Tout voir',
  MORE: (n: number) => `et ${n} autre${n > 1 ? 's' : ''}`,
} as const;

/** Les groupes de la vue Liste. « En retard » se signale, les autres non. */
export const AGENDA_HORIZON_LABELS = {
  late: 'En retard',
  today: 'Aujourd’hui',
  week: 'Cette semaine',
  month: 'Ce mois-ci',
  later: 'Plus tard',
  done: 'Historique',
} as const;

/**
 * Couleur de chaque groupe. Seul le retard se signale — colorer les cinq
 * autres reviendrait a ne rien signaler du tout. « Historique » reste neutre :
 * c'est du passe, il ne demande aucune action.
 */
export const AGENDA_HORIZON_TONES: Record<AgendaHorizon, Tone> = {
  late: 'destructive',
  today: 'warning',
  week: 'secondary',
  month: 'secondary',
  later: 'secondary',
  done: 'secondary',
};

/** La liste ne suit pas le mois affiché : on le dit, sinon on cherche. */
export const AGENDA_LIST_WINDOW_HINT =
  'La liste couvre les trente derniers jours et les trois mois à venir, quel que soit le mois affiché.';
