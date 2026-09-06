/** Grille tarifaire — L2 · US-02-01. Routes scopees projet. */
export const PRICING_ROUTES = {
  PRICING_GRIDS_API: '/pricing-grids',
  ACTIVE_GRID_API: '/pricing-grids/active',
  GRID_API: (id: string) => `/pricing-grids/${id}`,
} as const;

/**
 * Aucune version active sur le projet.
 *
 * Ce n'est pas une panne : un projet neuf n'a pas encore de grille. Tout ce
 * qui en depend — le filtre par strate, le libelle de strate d'une fiche —
 * disparait alors, sans message d'erreur.
 */
export const PRICING_NO_ACTIVE = 'PRICING_GRID_NO_ACTIVE';

export const PRICING_UI = {
  TITLE: 'Grille tarifaire',
  DESCRIPTION: 'Strates, formules et prix — une version datée à la fois',

  /**
   * Une grille est un **document date**, pas un reglage.
   *
   * Sans cette phrase en tete d'ecran, l'utilisateur modifie un prix, voit
   * « enregistre », et ne comprend pas pourquoi ses devis gardent l'ancien
   * tarif. C'est le seul risque serieux de cet ecran.
   */
  LEAD:
    'Chaque version est une photo complète et datée. Une seule chiffre les devis à un instant donné ; les devis déjà émis restent attachés à la leur.',

  COLUMNS: {
    VERSION: 'Version',
    EFFECTIVE_DATE: 'Date d’effet',
    STATE: 'État',
    QUOTES: 'Devis chiffrés',
    CREATED_BY: 'Créée par',
    CREATED_AT: 'Créée le',
  },

  STATE: {
    ACTIVE: 'Active',
    PREPARED: 'En préparation',
    REPLACED: 'Remplacée',
  },

  /** La filiation, quand elle existe : le signal qui manque a qui active. */
  DERIVED_FROM: (v: number) => `dérivée de la v${v}`,
  VERSION: (v: number) => `v${v}`,

  EMPTY: {
    TITLE: 'Aucune grille tarifaire',
    BODY: 'Ce projet n’a pas encore de grille : les devis ne peuvent pas être chiffrés.',
  },

  /** Le tiroir : les cinq tableaux de la V8, replies en accordeon. */
  DRAWER: {
    SECTIONS: {
      BRACKETS: 'Tranches de population',
      SUBSCRIPTION: 'Abonnement HT par mois',
      OPTIONS: 'Options mensuelles HT',
      SETUP: 'Frais de mise en place HT',
      EXTRAS: 'Matériel et prestations libres',
    },
    /** Ce que chaque section contient, dit sur son en-tete repliee. */
    COUNT: (n: number, one: string, many: string) =>
      `${n} ${n > 1 ? many : one}`,
    BRACKET_COUNT: ['strate', 'strates'] as const,
    PLAN_COUNT: ['formule', 'formules'] as const,
    OPTION_COUNT: ['option', 'options'] as const,
    SETUP_COUNT: ['poste', 'postes'] as const,
    EXTRA_COUNT: ['prestation', 'prestations'] as const,

    FROM: 'De',
    TO: 'À',
    OPEN_ENDED: 'et plus',
    LABEL: 'Libellé',
    PLAN: 'Formule',
    POST: 'Poste',
    UNIT_PRICE: 'Prix unitaire HT',
    INCLUDED: (n: number) => `${n} inclus dans l’abonnement`,
    NO_OPTIONS: 'Aucune option mensuelle.',
    NO_EXTRAS: 'Aucune prestation libre.',
    NO_SETUP: 'Aucun frais de mise en place.',
    CLOSE: 'Fermer',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les grilles tarifaires',
  },
} as const;
