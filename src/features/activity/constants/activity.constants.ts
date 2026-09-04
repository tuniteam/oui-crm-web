import type { Tone } from '@/shared/constants/tone';
import type { ActivityStatus } from '../types/activity';

/** Actions commerciales — L1 · US-01-08. Routes scopées projet. */
export const ACTIVITY_ROUTES = {
  ACTIVITIES_API: '/activities',
  ACTIVITY_API: (id: string) => `/activities/${id}`,
  ACTIVITY_COMPLETE_API: (id: string) => `/activities/${id}/complete`,
  ACTIVITY_CANCEL_API: (id: string) => `/activities/${id}/cancel`,
} as const;

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  PLANNED: 'Planifiée',
  DONE: 'Réalisée',
  CANCELLED: 'Annulée',
};

/**
 * Une action realisee est un aboutissement : elle est verte. La frise sortait
 * jusqu'ici « Réalisée » dans la couleur de marque, parce que le composant
 * choisissait sa teinte lui-meme.
 */
export const ACTIVITY_STATUS_TONES: Record<ActivityStatus, Tone> = {
  PLANNED: 'info',
  DONE: 'success',
  CANCELLED: 'secondary',
};

/**
 * Resultat d'une action. Les cles viennent du referentiel projet
 * (`ACTIVITY_RESULT`), que l'administrateur peut enrichir : une cle absente de
 * cette table sort en neutre, jamais en couleur choisie au hasard.
 */
export const ACTIVITY_RESULT_TONES: Partial<Record<string, Tone>> = {
  MEETING_BOOKED: 'success',
  INTERESTED: 'success',
  DOCUMENTATION_SENT: 'info',
  CALL_BACK: 'info',
  NO_ANSWER: 'secondary',
  WRONG_CONTACT: 'warning',
  NOT_INTERESTED: 'destructive',
};

/** Codes d'erreur routés par l'écran. */
export const ACTIVITY_ERRORS = {
  ALREADY_CLOSED: 'ACTIVITY_ALREADY_CLOSED',
  INVALID_REFERENCE: 'INVALID_REFERENCE_VALUE',
} as const;

/** Catégories du référentiel projet où vivent les vocabulaires. */
export const ACTIVITY_REFERENCE = {
  TYPE: 'ACTIVITY_TYPE',
  RESULT: 'ACTIVITY_RESULT',
} as const;

/**
 * Créneau ouvrable et pas des minutes.
 *
 * Le contrat accepte n'importe quelle heure de `00:00` à `23:59` : la
 * restriction est un choix d'interface, pas une règle serveur. Elle borne les
 * colonnes du sélecteur partagé et évite les rendez-vous saisis à 3 h du matin
 * par une erreur de frappe.
 */
export const TIME_SLOT = {
  MIN: '08:00',
  MAX: '19:00',
  STEP_MINUTES: 15,
} as const;


export const ACTIVITIES_UI = {
  TAB: 'Actions',

  ADD: 'Enregistrer une action',

  /**
   * Bandeau de tête. Une action en retard reste la « prochaine » : elle ne
   * disparaît pas parce que sa date est passée, c'est justement celle qu'il
   * faut traiter. La phrase se compose ici, d'un bloc, plutôt que d'être
   * recousue de fragments dans le JSX.
   */
  NEXT: {
    LINE: (type: string, day: string, time: string | null, late: number | null) =>
      [
        `Prochaine action : ${type} le ${day}`,
        time ? ` à ${time}` : '',
        late !== null ? ` — en retard de ${late} jour${late > 1 ? 's' : ''}` : '',
      ].join(''),
    NONE: 'Aucune action planifiée.',
  },

  /** La frise, comme la V8 : ce qui s'est dit, pas un tableau de champs. */
  TIMELINE: {
    NO_REPORT: 'Aucun compte rendu saisi.',
    AT: (time: string) => `à ${time}`,
    DURATION: (min: number) =>
      min >= 60 && min % 60 === 0
        ? `${min / 60} h`
        : min > 60
          ? `${Math.floor(min / 60)} h ${min % 60}`
          : `${min} min`,
  },

  ACTIONS: {
    COMPLETE: 'Marquer réalisée',
    EDIT: 'Modifier',
    CANCEL: 'Annuler l’action',
    DELETE: 'Supprimer',
  },

  EMPTY: {
    TITLE: 'Aucune action',
    DESCRIPTION:
      'Enregistrez un appel, un email ou un rendez-vous : c’est ce qui fait avancer la fiche.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les actions',
    ORGANIZATION_REQUIRED: 'Choisissez un organisme',
    /** Une action close est de l'histoire : on recharge plutôt que d'insister. */
    CLOSED:
      'Cette action n’est plus modifiable : elle a été réalisée ou annulée entre-temps.',
  },

  TOASTS: {
    CREATED: 'Action enregistrée',
    UPDATED: 'Action modifiée',
    COMPLETED: 'Action marquée réalisée',
    CANCELLED: 'Action annulée',
    DELETED: 'Action supprimée',
  },
} as const;

export const ACTIVITY_WINDOW = {
  CREATE_TITLE: 'Enregistrer une action',
  EDIT_TITLE: 'Modifier l’action',

  FIELDS: {
    /** Demandé seulement quand l'écran ne fournit pas de fiche — l'agenda. */
    ORGANIZATION: 'Organisme',
    ORGANIZATION_PLACEHOLDER: 'Choisir un organisme',
    /** Hors périmètre, le serveur refuse la création : la ligne reste inerte. */
    ORGANIZATION_RESTRICTED: (name: string) => `${name} — hors de votre périmètre`,
    TYPE: 'Type',
    /**
     * Aucun type n'est presélectionné. La maquette pré-choisit « Appel », mais
     * un défaut invisible fait enregistrer le mauvais type sans que personne
     * s'en aperçoive : le champ est obligatoire, le choix est explicite.
     */
    TYPE_PLACEHOLDER: 'Choisir un type',
    DATE: 'Date',
    TIME: 'Heure',
    DURATION: 'Durée (minutes)',
    LOCATION: 'Lieu',
    CONTACT: 'Interlocuteur',
    CONTACT_NONE: 'Aucun',
    REPORT: 'Notes',
    REPORT_PLACEHOLDER: 'Ce qu’il faut préparer, le sujet à aborder…',
  },

  HINTS: {
    /**
     * La maquette met un sélecteur « Réalisée / Planifiée » ici, et le compte
     * rendu dans le même écran. Le contrat ne le permet pas : toute action
     * naît planifiée, et la réaliser est un geste distinct qui exige un
     * compte rendu. L'écran le dit plutôt que de laisser chercher.
     */
    PLANNED: 'L’action est enregistrée comme planifiée. Vous la marquerez réalisée depuis la fiche, avec son compte rendu.',
    /** Automatisme du contrat, invisible sans cette phrase. */
    MEETING: 'Planifier ce type de rendez-vous fera passer la fiche en « RDV planifié ».',
  },

  ACTIONS: {
    SAVE: 'Enregistrer',
    CREATE: 'Enregistrer l’action',
    CANCEL: 'Annuler',
  },
} as const;

export const ACTIVITY_COMPLETE_WINDOW = {
  TITLE: 'Marquer l’action réalisée',

  FIELDS: {
    REPORT: 'Compte rendu',
    REPORT_PLACEHOLDER:
      'Ce qui s’est dit, les objections, les prochaines étapes…',
    RESULT: 'Résultat',
    RESULT_NONE: 'Non précisé',
  },

  /** Le compte rendu n'est pas une formalité : il est ce qui rend l'action réelle. */
  HINT: 'Le compte rendu est ce qui rend l’action réelle : il est obligatoire.',
  SIDE_EFFECT:
    'Une fiche encore « Non contacté » ou « À contacter » passera « En cours ».',

  ACTIONS: {
    CONFIRM: 'Marquer réalisée',
    CANCEL: 'Annuler',
  },
} as const;

export const ACTIVITY_DELETE_WINDOW = {
  TITLE: 'Supprimer l’action',
  CONFIRM: 'Cette action sera définitivement supprimée de l’historique.',
  /**
   * Constaté en direct : supprimer ou annuler un rendez-vous ne fait **pas**
   * redescendre le statut commercial de la fiche. Le dire vaut mieux que de
   * laisser croire à une annulation propre. Signalé à l'API — quand ce sera
   * corrigé, cet avertissement saute.
   */
  STATUS_WARNING:
    'Le statut commercial de la fiche ne reviendra pas en arrière : une fiche passée « RDV planifié » le restera.',

  ACTIONS: {
    CONFIRM: 'Supprimer',
    CANCEL: 'Annuler',
  },
} as const;

export const ACTIVITY_CANCEL_WINDOW = {
  TITLE: 'Annuler l’action',
  CONFIRM:
    'L’action restera dans l’historique, marquée annulée. Elle ne pourra plus être modifiée.',
  STATUS_WARNING: ACTIVITY_DELETE_WINDOW.STATUS_WARNING,

  ACTIONS: {
    CONFIRM: 'Annuler l’action',
    CANCEL: 'Revenir',
  },
} as const;
