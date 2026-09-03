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
  },
} as const;
