/**
 * La grille tarifaire d'un projet — L2 · US-02-01.
 *
 * Une grille est un **document date et versionne**, pas un reglage : une seule
 * version est active, et les devis deja chiffres restent attaches a la leur.
 * Voir `docs/ETUDE-GRILLE-TARIFAIRE.md`.
 */
export type PricingBracket = {
  /** Ce qui s'affiche et ce que `?bracket=` attend — « 0 – 500 hab. ». */
  label: string;
  min: number;
  /** `null` sur la strate ouverte, qui est toujours la derniere. */
  max: number | null;
};

export type PricingGridContent = {
  brackets: PricingBracket[];
  plans: string[];
  /** Un tableau de prix par formule, **une valeur par strate**. */
  subscription: Record<string, number[]>;
  options?: { id: number; name: string; unitPrice: number[]; included?: number }[];
  /** La cle (`training`, `deployment`, `configuration`) est reconnue par le
   *  serveur pour ventiler le une-fois : la renommer casserait la ventilation. */
  setupFees?: Record<string, { label: string } & Record<string, unknown>>;
  extras?: { id: number; name: string; unitPrice: number }[];
};

export type PricingGrid = {
  id: string;
  version: number;
  effectiveDate: string;
  active: boolean;
  createdBy: { id: string; fullName: string; initials: string } | null;
  createdAt: string;
  /** Devis figes sur cette version : au-dela de 0, c'est une archive. */
  quotesCount: number;
  /**
   * De quelle version celle-ci derive — ajoute le 06/09 a la demande du front.
   *
   * `null` pour la version du seed et pour une grille ecrite de zero. C'est ce
   * qui permet d'afficher « v6 · derivee de la v1 », et ce sur quoi le serveur
   * refuse d'activer une version preparee sur une grille perimee
   * (`409 PRICING_GRID_BASE_OUTDATED`).
   */
  basedOnVersion: number | null;
  content: PricingGridContent;
};

/** `GET /pricing-grids` — la liste, **sans** `content`. */
export type PricingGridSummary = Omit<PricingGrid, 'content'>;

export type PricingGridListResponse = {
  data: PricingGridSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};
