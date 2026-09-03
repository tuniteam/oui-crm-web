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

  TODAY: 'Aujourd’hui',
  PREVIOUS: 'Mois précédent',
  NEXT: 'Mois suivant',

  WEEKDAYS: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'],

  FILTERS: {
    USER: 'Collaborateur',
    /** Visible seulement hors portée `OWN` : voir le commentaire de l'écran. */
    USER_ALL: 'Tous les collaborateurs',
  },

  /**
   * Les trois autres sources du contrat — formations, échéances de contrat,
   * fins de devis — arrivent aux lots L2 à L4. On le dit au lieu d'offrir des
   * cases à cocher qui ne peuvent rien filtrer : un zéro affiché est une
   * information, un filtre inerte est un piège à clic.
   */
  SOURCES_HINT:
    'Seules les actions commerciales figurent à ce stade. Formations, échéances de contrat et fins de devis les rejoindront.',

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
