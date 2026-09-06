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
  content: PricingGridContent;
};
