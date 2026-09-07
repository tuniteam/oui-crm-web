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

/**
 * Un devis **emis** retient la version — SPEC-18.
 *
 * Les brouillons ne bloquent pas : ils sont recalcules dans la meme
 * transaction. `quotesCount` ne distingue pas les deux, le front ne peut donc
 * pas trancher : il tente la correction et lit ce code.
 */
export const PRICING_HAS_QUOTES = 'PRICING_GRID_HAS_QUOTES';
export const PRICING_DATE_INVALID = 'PRICING_GRID_EFFECTIVE_DATE_INVALID';

/**
 * Combien de versions la liste charge d'un coup.
 *
 * Le defaut du contrat, et il suffit : une grille se revise quelques fois par
 * an, pas quotidiennement. La pagination viendra si un projet la depasse.
 */
export const PRICING_PAGE_SIZE = 20;

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
    ACTIONS: 'Actions',
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

  VIEW: 'Voir la version',

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

  /**
   * L'edition — tranche B.
   *
   * Rien ne part au serveur pendant la saisie : « Modifier » copie le contenu
   * en memoire, et « Enregistrer » envoie **un seul** `POST`. Dans la V8 chaque
   * case portait un `onchange` : transpose ici, cela creerait une version par
   * case modifiee, sans aucune route pour les retirer.
   */
  EDIT: {
    START: 'Modifier les tarifs',
    /**
     * Corriger sur place remplace la creation d'une version — SPEC-18.
     *
     * Tant qu'aucun devis **emis** n'est attache, on repare la version au lieu
     * d'en empiler une de plus. Le serveur tranche : `quotesCount` ne
     * distingue pas les brouillons des devis emis.
     */
    FIX: 'Enregistrer les corrections',
    FIXED: (v: number) => `Version ${v} corrigée.`,

    /**
     * Corriger la version **active** change les prix en vigueur, sans geste
     * d'activation. Ce n'est plus preparer, c'est appliquer.
     */
    ACTIVE_WARNING:
      'Cette version est active : vos corrections changeront les tarifs en vigueur immédiatement, sans activation.',

    /** Un devis emis retient la version : la seule issue est d'en creer une. */
    HAS_QUOTES: (n: number) =>
      `${n} devis émis est attaché à cette version : elle ne peut plus être corrigée.`,
    HAS_QUOTES_FALLBACK: 'Créer une nouvelle version à la place',
    CANCEL: 'Annuler les modifications',
    /** Le bouton dit ce qu'il fait : le versionnement doit etre visible au
     *  moment ou il compte. */
    SAVE: (next: number) => `Enregistrer — créera la v${next}`,
    DIRTY: (n: number) =>
      `${n} modification${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''}`,
    LEAVE_WARNING:
      'Vos modifications ne sont pas enregistrées. Fermer les perdra.',
    LEAVE_CONFIRM: 'Fermer sans enregistrer',
    LEAVE_STAY: 'Continuer à modifier',

    /**
     * Modifier une version qui n'est pas l'active repart de **son** contenu.
     *
     * Si v5 est active et qu'on corrige v1, la version 6 naitra du contenu de
     * v1 et effacera, en devenant active, tout ce qui a ete fait entre-temps.
     * Le serveur refuse desormais de l'activer (`409`), mais le dire ici evite
     * de creer la version pour rien.
     */
    NOT_ACTIVE: (edited: number, active: number) =>
      `Cette version sera créée à partir de la v${edited}, non de la version active (v${active}).`,
  },

  SAVE_WINDOW: {
    TITLE: 'Enregistrer une nouvelle version',
    LEAD: (next: number) =>
      `Vos modifications formeront la version ${next}. Elle naît **inactive** : les devis continuent d'être chiffrés avec la version active jusqu'à ce que vous l'activiez.`,
    EFFECTIVE_DATE: 'Date d’effet prévue',
    /** Declarative : aucun automatisme ne bascule la grille a cette date. */
    EFFECTIVE_HINT:
      'Documentaire : aucune bascule automatique. L’activation reste un geste explicite.',
    CONFIRM: 'Créer la version',
    CANCEL: 'Annuler',
    SAVED: (v: number) => `Version ${v} créée — elle n’est pas encore active.`,
  },

  ERRORS: {
    FETCH: 'Impossible de charger les grilles tarifaires',
    SAVE: 'Impossible d’enregistrer la grille',
    /** `details[]` porte le chemin fautif : on les rend tels quels tant que la
     *  resolution en cellules n'est pas faite (tranche C). */
    INVALID: 'La grille est refusée : ',
  },
} as const;
