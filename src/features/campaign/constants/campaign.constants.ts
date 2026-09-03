import type { CampaignStatus } from '../types/campaign';

/** Campagnes — L1 · US-01-11. Routes scopées projet. */
export const CAMPAIGN_ROUTES = {
  CAMPAIGNS_API: '/campaigns',
  CAMPAIGN_API: (id: string) => `/campaigns/${id}`,
  CAMPAIGN_STATUS_API: (id: string) => `/campaigns/${id}/status`,
  CAMPAIGN_ORGANIZATIONS_API: (id: string) => `/campaigns/${id}/organizations`,
  CAMPAIGN_ORGANIZATION_API: (id: string, orgId: string) =>
    `/campaigns/${id}/organizations/${orgId}`,
  CAMPAIGN_RESULTS_API: (id: string) => `/campaigns/${id}/results`,
} as const;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'En cours',
  CLOSED: 'Close',
};

/** Ce que fait le passage à ce statut, dit du point de vue de l'utilisateur. */
export const CAMPAIGN_TRANSITION_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Repasser en brouillon',
  ACTIVE: 'Lancer la campagne',
  CLOSED: 'Clore la campagne',
};

export const CAMPAIGNS_UI = {
  TITLE: 'Campagnes',
  SUBTITLE:
    'Un ciblage nommé, daté et mesuré. La campagne fige une liste d’organismes et suit ce qu’elle produit.',

  ADD: 'Nouvelle campagne',

  CARD: {
    /** `owner` peut être absent : le serveur ne garantit pas un responsable. */
    UNASSIGNED: 'Non affectée',
    PERIOD: (start: string, end: string) => `du ${start} au ${end}`,
    PERIOD_FROM: (start: string) => `depuis le ${start}`,
    PERIOD_UNTIL: (end: string) => `jusqu’au ${end}`,
    NO_PERIOD: 'Sans période',
    /** Les critères sont **documentaires** : ils disent comment la cible a été
     *  construite, ils ne la reconstruisent pas. */
    CRITERIA: 'Critère de ciblage',
    NO_CRITERIA: 'Cible constituée à la main',
    ORGANIZATIONS: (n: number) =>
      n === 0
        ? 'Aucun organisme ciblé'
        : `Voir les ${n} organisme${n > 1 ? 's' : ''}`,
  },

  /** Les quatre barres de la maquette. Seule la première est alimentée au L1. */
  RESULTS: {
    ACTIVITIES: 'Actions',
    OPPORTUNITIES: 'Opportunités',
    QUOTES: 'Devis',
    SIGNED: 'Signés',
    PENDING_HINT: 'Alimenté à partir du lot L2.',
  },

  FILTER_ALL_STATUSES: 'Tous les statuts',

  EMPTY: {
    TITLE: 'Aucune campagne',
    DESCRIPTION:
      'Créez une campagne pour cibler un ensemble d’organismes et mesurer ce qu’elle rapporte.',
  },

  ACTIONS: {
    EDIT: 'Modifier',
    DELETE: 'Supprimer',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les campagnes',
    NAME_TAKEN: 'Ce nom est déjà utilisé par une autre campagne.',
  },

  TOASTS: {
    CREATED: 'Campagne créée',
    UPDATED: 'Campagne modifiée',
    STATUS_CHANGED: 'Statut mis à jour',
  },
} as const;

export const CAMPAIGN_WINDOW = {
  CREATE_TITLE: 'Nouvelle campagne',
  EDIT_TITLE: 'Modifier la campagne',

  FIELDS: {
    NAME: 'Nom',
    NAME_PLACEHOLDER: 'Campagne rentrée scolaire 2027',
    DESCRIPTION: 'Objectif',
    DESCRIPTION_PLACEHOLDER: 'Périmètre, message, objectif chiffré',
    OWNER: 'Responsable',
    OWNER_DEFAULT: 'Moi',
    START: 'Début',
    END: 'Fin',
  },

  HINTS: {
    /**
     * La maquette propose six filtres de ciblage dans cette fenêtre, ce qui
     * suggérerait une cible qui se recalcule. Elle ne se recalcule pas : la
     * liste se remplit par une action dédiée, et les critères ne sont qu'une
     * note. Le champ est donc absent, et l'écran le dit.
     */
    TARGET:
      'La cible se remplit après la création, depuis la campagne ou la liste des organismes.',
  },

  ACTIONS: {
    SAVE: 'Enregistrer',
    CREATE: 'Créer la campagne',
    CANCEL: 'Annuler',
  },
} as const;

/** Codes d'erreur routés par l'écran. */
export const CAMPAIGN_ERRORS = {
  NAME_EXISTS: 'CAMPAIGN_NAME_EXISTS',
  INVALID_TRANSITION: 'INVALID_STATUS_TRANSITION',
  IN_USE_BY_SCOPE: 'CAMPAIGN_IN_USE_BY_SCOPE',
} as const;
