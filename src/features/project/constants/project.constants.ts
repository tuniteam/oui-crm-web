export const PROJECT_ROUTES = {
  PROJECTS_API: '/projects',
} as const;

/** Route front de la liste des projets. */
export const PROJECT_PATHS = {
  LIST: '/projects',
} as const;

/** Statuts d'un projet. Source de verite : enum ProjectStatus de l'API. */
export const PROJECT_STATUS_VALUES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

export const PROJECT_STATUS = {
  DRAFT: PROJECT_STATUS_VALUES[0],
  ACTIVE: PROJECT_STATUS_VALUES[1],
  ARCHIVED: PROJECT_STATUS_VALUES[2],
} as const;

export const PROJECT_STATUS_LABELS: Record<
  (typeof PROJECT_STATUS_VALUES)[number],
  string
> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  ARCHIVED: 'Archivé',
};

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

export const PROJECTS_TABLE_UI = {
  COLUMNS: {
    NAME: 'Projet',
    PRODUCT: 'Produit',
    STATUS: 'Statut',
    FEATURES: 'Fonctionnalités',
    USER_COUNT: 'Utilisateurs',
    CREATED_AT: 'Créé le',
  },
  EMPTY_STATE: {
    TITLE: 'Aucun projet',
    DESCRIPTION: [
      'Aucun projet ne correspond à votre recherche.',
      'Créez un projet pour commencer.',
    ],
  },
  NO_FEATURE: 'Aucune',
} as const;

export const PROJECT_SEARCH = {
  PLACEHOLDER: 'Rechercher un projet…',
  TOOLTIP: 'Recherche par nom, identifiant ou produit',
  STATUS_PLACEHOLDER: 'Statut',
  ALL_STATUSES: 'Tous les statuts',
} as const;

export const PROJECT_ACTIONS = {
  NEW_PROJECT: 'Nouveau projet',
} as const;

export const PROJECT_ERRORS = {
  FETCH_PROJECTS: 'Impossible de récupérer les projets.',
} as const;
