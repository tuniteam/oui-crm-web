import { STATUS_CONFIG } from '@/components/shared/status-config';

/** Statuts d'un projet. Source de verite : enum ProjectStatus de l'API. */
export const PROJECT_STATUS_VALUES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

export const PROJECT_STATUS = {
  DRAFT: PROJECT_STATUS_VALUES[0],
  ACTIVE: PROJECT_STATUS_VALUES[1],
  ARCHIVED: PROJECT_STATUS_VALUES[2],
} as const;

/**
 * Options du filtre de statut. Les libelles sont derives de STATUS_CONFIG,
 * qui pilote deja les badges : une seule source pour le badge et le filtre.
 */
export const PROJECT_STATUS_OPTIONS = PROJECT_STATUS_VALUES.map((value) => ({
  value,
  label: STATUS_CONFIG[value]?.label ?? value,
}));

/** Fonctionnalites activables. Source de verite : enum FeatureCode de l'API. */
export const FEATURE_CODE_VALUES = [
  'SALES',
  'BILLING',
  'SUPPORT',
  'STATS',
] as const;

export const FEATURE_LABELS: Record<
  (typeof FEATURE_CODE_VALUES)[number],
  string
> = {
  SALES: 'Ventes',
  BILLING: 'Facturation',
  SUPPORT: 'Support',
  STATS: 'Statistiques',
};

export const TABLE_HEADERS = {
  NAME: 'Projet',
  PRODUCT: 'Produit',
  STATUS: 'Statut',
  FEATURES: 'Fonctionnalités',
  USER_COUNT: 'Utilisateurs',
  CREATED_AT: 'Créé le',
  ACTIONS: 'Actions',
} as const;

export const ACTIONS = {
  NEW_PROJECT: 'Nouveau projet',
  VIEW_PROJECT: 'Voir le projet',
  OPEN_PROJECT: 'Ouvrir le projet dans un onglet',
} as const;

export const SEARCH = {
  PLACEHOLDER: 'Rechercher un projet…',
  TOOLTIP_TEXT: 'Recherche par nom, identifiant ou produit',
  STATUS_PLACEHOLDER: 'Statut',
  ALL_STATUSES_SELECT_OPTION: 'Tous les statuts',
} as const;

export const PROJECTS_TABLE_UI = {
  EMPTY_STATE: {
    TITLE: 'Aucun projet',
    DESCRIPTION: [
      'Aucun projet ne correspond à votre recherche.',
      'Créez un projet pour commencer.',
    ],
    TIP: {
      TITLE: 'À savoir',
      CONTENT: [
        'Un projet est créé en brouillon : il reste fermé à ses utilisateurs tant qu’il n’est pas activé.',
      ],
    },
  },
  NO_FEATURE: 'Aucune',
} as const;

export const PROJECT_INFORMATION_UI = {
  TABS: {
    INFORMATION: {
      VALUE: 'informations',
      LABEL: 'Informations',
    },
  },
  SECTIONS: {
    IDENTITY: 'Identité',
    ACTIVITY: 'Activité',
    FEATURES: 'Fonctionnalités',
  },
  FIELDS: {
    NAME: 'Nom',
    SLUG: 'Identifiant',
    PRODUCT: 'Produit',
    DESCRIPTION: 'Description',
    STATUS: 'Statut',
    USER_COUNT: 'Utilisateurs',
    ACTIVATED_AT: 'Activé le',
    CREATED_AT: 'Créé le',
    UPDATED_AT: 'Modifié le',
  },
  FEATURES: {
    ENABLED: 'Activée',
    DISABLED: 'Désactivée',
    EMPTY: 'Aucune fonctionnalité déclarée.',
  },
  FALLBACK: '—',
} as const;

export const PROJECT_NOT_FOUND = {
  TITLE: 'Projet introuvable',
  DESCRIPTION: "Ce projet n'existe pas ou a été supprimé.",
  BACK: 'Retour aux projets',
} as const;

export const ERRORS = {
  FETCH_PROJECTS: 'Impossible de récupérer les projets.',
} as const;
