import type { ScopeNature } from '../types/scopes';

/** Périmètres — US-00-07. Routes scopées projet, comme tout le socle. */
export const SCOPE_ROUTES = {
  SCOPES_API: '/scopes',
  SCOPE_API: (scopeId: string) => `/scopes/${scopeId}`,
  /** Table statique de 14 régions : à ne demander qu'une fois. */
  GEO_REGIONS_API: '/geo/regions',
} as const;

export const SCOPE_NATURE_LABELS: Record<ScopeNature, string> = {
  ALL: 'Prospects et clients',
  PROSPECTS: 'Prospects uniquement',
  CUSTOMERS: 'Clients uniquement',
};

export const SCOPES_UI = {
  TITLE: 'Périmètres d’utilisation',
  DESCRIPTION:
    'Un périmètre est nommé et réutilisable : il s’affecte à plusieurs utilisateurs. Les axes se combinent par intersection — géographie, portefeuille personnel et nature des fiches.',

  ADD: 'Nouveau périmètre',

  /** Ce que porte une carte de périmètre. */
  CARD: {
    USERS: (n: number) => `${n} utilisateur${n > 1 ? 's' : ''}`,
    /**
     * Une liste vide de départements résolus signifie **tout le territoire**.
     * Afficher « 0 département » serait un contresens exact.
     */
    WHOLE_TERRITORY: 'France entière',
    DEPARTMENTS: (n: number) => `${n} département${n > 1 ? 's' : ''}`,
    PORTFOLIO_ONLY: 'Portefeuille personnel',
    CAMPAIGNS: (n: number) => `${n} campagne${n > 1 ? 's' : ''}`,
  },

  ACTIONS: {
    EDIT: 'Modifier',
    DELETE: 'Supprimer',
  },

  EMPTY: {
    TITLE: 'Aucun périmètre',
    DESCRIPTION:
      'Sans périmètre, chaque utilisateur voit toute la base. Créez-en un pour restreindre l’accès par géographie, par portefeuille ou par nature de fiche.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les périmètres',
    NAME_TAKEN: 'Ce nom est déjà utilisé par un autre périmètre.',
  },

  TOASTS: {
    CREATED: 'Périmètre créé',
    UPDATED: 'Périmètre modifié',
  },
} as const;

/** Codes d'erreur routés par le formulaire. */
export const SCOPE_ERRORS = {
  NAME_EXISTS: 'SCOPE_NAME_EXISTS',
  IN_USE: 'SCOPE_IN_USE',
} as const;

export const SCOPE_WINDOW = {
  CREATE_TITLE: 'Nouveau périmètre',
  EDIT_TITLE: 'Modifier le périmètre',
  /** Le geste central de l'écran, annoncé avant les cases. */
  DESCRIPTION:
    'Cocher une région coche ses départements ; chacun reste décochable.',

  FIELDS: {
    NAME: 'Nom',
    NAME_PLACEHOLDER: 'Normandie et Hauts-de-France',
    DESCRIPTION: 'Description',
    NATURE: 'Nature des fiches',
    PORTFOLIO_ONLY: 'Limiter au portefeuille personnel',
    PORTFOLIO_HINT:
      'Uniquement les fiches dont l’utilisateur est commercial, consultant ou formateur affecté.',
    GEOGRAPHY: 'Régions et départements',
  },

  /** Compteur d'aide à la saisie : il se calcule à partir des cases cochées,
   *  et n'a rien à voir avec `resolvedDepartments`, rendu par le serveur. */
  COUNT: (n: number) =>
    n === 0
      ? 'Aucun département coché : le périmètre couvre tout le territoire.'
      : `${n} département${n > 1 ? 's' : ''} coché${n > 1 ? 's' : ''}.`,

  ACTIONS: {
    SAVE: 'Enregistrer',
    CREATE: 'Créer le périmètre',
    CANCEL: 'Annuler',
    SELECT_ALL: 'Tout cocher',
    CLEAR: 'Tout décocher',
  },
} as const;
