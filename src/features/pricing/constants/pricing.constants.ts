/** Grille tarifaire — L2 · US-02-01. Routes scopees projet. */
export const PRICING_ROUTES = {
  PRICING_GRIDS_API: '/pricing-grids',
  ACTIVE_GRID_API: '/pricing-grids/active',
} as const;

/**
 * Aucune version active sur le projet.
 *
 * Ce n'est pas une panne : un projet neuf n'a pas encore de grille. Tout ce
 * qui en depend — le filtre par strate, le libelle de strate d'une fiche —
 * disparait alors, sans message d'erreur.
 */
export const PRICING_NO_ACTIVE = 'PRICING_GRID_NO_ACTIVE';
