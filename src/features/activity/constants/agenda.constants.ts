import type { Tone } from '@/shared/constants/tone';
import { AGENDA_HORIZONS, type AgendaHorizon } from '../types/agenda';
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
  /** Une action close dans la liste : l'opacité seule ne disait pas pourquoi. */
  DONE: 'Réalisée',
  MORE: (n: number) => `+${n}`,

  /**
   * Un message par filtre, pas un seul pour les quatre. « Rien de planifié »
   * sous « En retard » disait faux deux fois : il y a peut-etre dix actions
   * planifiees, et l'absence de retard est une bonne nouvelle, pas un manque a
   * combler.
   */
  EMPTY: {
    todo: {
      TITLE: 'Rien à faire',
      DESCRIPTION:
        'Aucune action à venir. Planifiez-en une depuis la fiche d’un organisme.',
    },
    late: {
      TITLE: 'Aucun retard',
      DESCRIPTION: 'Toutes les actions planifiées sont dans les temps.',
    },
    done: {
      TITLE: 'Aucune action réalisée',
      DESCRIPTION:
        'L’historique se remplit à mesure que les actions sont marquées réalisées.',
    },
    all: {
      TITLE: 'Rien de planifié',
      DESCRIPTION:
        'Planifiez une action depuis la fiche d’un organisme : elle apparaîtra ici.',
    },
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
 * Couleur de chaque groupe — une **echelle d'urgence**, pas un tout-ou-rien.
 * Le rouge reste unique au retard : c'est lui, et lui seul, qui alerte. En
 * dessous, la chaleur decroit avec l'echeance (ambre aujourd'hui, sarcelle
 * cette semaine, bleu ce mois-ci) et s'eteint sur ce qui ne presse pas.
 * « Historique » reste neutre : c'est du passe, il ne demande aucune action.
 */
export const AGENDA_HORIZON_TONES: Record<AgendaHorizon, Tone> = {
  late: 'destructive',
  today: 'warning',
  week: 'info',
  month: 'primary',
  later: 'secondary',
  done: 'secondary',
};

/**
 * Le filet de gauche d'une ligne, dans le ton de son groupe. Ce n'est ni une
 * pastille ni un bouton : il colore la liste sans y ajouter d'objet, et ne
 * touche donc pas a la regle `docs/REGLE-BADGE-VS-BOUTON.md`.
 */
export const AGENDA_HORIZON_ACCENTS: Record<AgendaHorizon, string> = {
  late: 'border-s-destructive',
  today: 'border-s-warning',
  week: 'border-s-info',
  month: 'border-s-primary',
  later: 'border-s-border',
  done: 'border-s-success',
};

/**
 * Le remplissage, pour les seules cartes de la grille du mois : une cellule de
 * calendrier est petite et dense, un filet seul s'y perd. Une ligne de liste,
 * aeree, se contente du filet.
 */
const AGENDA_HORIZON_FILLS: Record<AgendaHorizon, string> = {
  late: 'bg-destructive/10 hover:bg-destructive/15',
  today: 'bg-warning/10 hover:bg-warning/15',
  week: 'bg-info/10 hover:bg-info/15',
  month: 'bg-primary/10 hover:bg-primary/15',
  later: 'bg-muted/60 hover:bg-muted',
  done: 'bg-success/10 hover:bg-success/15',
};

/**
 * Filet + remplissage, composes plutot que reecrits : les deux moities d'une
 * meme echelle ne peuvent pas diverger. Comme le filet, un fond n'est ni une
 * pastille ni un bouton — la regle `docs/REGLE-BADGE-VS-BOUTON.md` ne le
 * concerne pas.
 */
export const AGENDA_HORIZON_SURFACES = Object.fromEntries(
  AGENDA_HORIZONS.map((h) => [
    h,
    `${AGENDA_HORIZON_ACCENTS[h]} ${AGENDA_HORIZON_FILLS[h]}`,
  ]),
) as Record<AgendaHorizon, string>;

/** La liste ne suit pas le mois affiché : on le dit, sinon on cherche. */
export const AGENDA_LIST_WINDOW_HINT =
  'La liste couvre les trente derniers jours et les trois mois à venir, quel que soit le mois affiché.';
