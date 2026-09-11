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

/**
 * Ce qu'un poste de frais **est** — SPEC-19, 07/09/2026.
 *
 * Commande la ventilation `oneShot: { setup, training, hardware }` servie a
 * chaque lecture de devis. Avant, le poste de formation se reconnaissait a sa
 * cle ecrite en dur `training` : le renommer faisait tomber la ventilation
 * « formation » a zero et basculait son montant dans « mise en place », sans
 * un mot.
 */
export type SetupFeeNature = 'TRAINING' | 'SETUP';

/**
 * Un poste de frais de mise en place.
 *
 * Sa cle est libre — un projet nomme ses postes comme il veut, peut en avoir
 * plusieurs de formation ou aucun. Ce sont `nature` qui dit ce qu'il est et
 * `label` qui l'identifie sur un devis fige, d'ou l'unicite des libelles.
 *
 * Les prix par formule vivent **dans le meme objet** que `label` et `nature`,
 * d'ou deux noms de formule reserves.
 */
export type PricingSetupFee = {
  label: string;
  nature: SetupFeeNature;
} & { [plan: string]: string | number[] };

/**
 * Une option mensuelle ou une prestation libre.
 *
 * `id` **absent** = element nouveau : le serveur en attribue un et le renvoie.
 * Un identifiant que le projet n'a jamais distribue est refuse
 * (`400 PRICING_GRID_UNKNOWN_ITEM_ID`), et un identifiant libere n'est jamais
 * reattribue — la suite a donc des trous, et **l'indice dans le tableau n'est
 * jamais un identifiant**. Sans cette regle, un numero recycle rebranchait en
 * silence les devis brouillons sur une ligne differente.
 */
export type PricingOption = {
  id?: number;
  name: string;
  /** Une valeur par strate, au **meme indice** que la strate. */
  unitPrice: number[];
  included?: number;
};

export type PricingExtra = {
  id?: number;
  name: string;
  /** Scalaire : les prestations libres sont la seule famille sans strate. */
  unitPrice: number;
};

export type PricingGridContent = {
  brackets: PricingBracket[];
  plans: string[];
  /** Un tableau de prix par formule, **une valeur par strate**. */
  subscription: Record<string, number[]>;
  options?: PricingOption[];
  setupFees?: Record<string, PricingSetupFee>;
  extras?: PricingExtra[];
};

/** Plafonds par famille — SPEC-19. Verifies en direct contre le serveur. */
export const PRICING_LIMITS = {
  brackets: 20,
  plans: 10,
  options: 30,
  setupFees: 20,
  extras: 30,
} as const;

/** Les deux noms qu'une formule ne peut pas porter : ce sont les attributs
 *  d'un poste de frais, qui vivent dans le meme objet que ses prix. */
export const RESERVED_PLAN_NAMES = ['label', 'nature'] as const;

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
  /**
   * Ce que le serveur autorise — SPEC-18, 07/09/2026.
   *
   * `reason` vaut `null`, `ALREADY_ACTIVE` ou `BASE_OUTDATED`. **Le front
   * grise le bouton et affiche la raison ; il ne recalcule pas la regle**, qui
   * vit cote serveur, une seule fois.
   */
  activation: {
    allowed: boolean;
    reason: 'ALREADY_ACTIVE' | 'BASE_OUTDATED' | null;
    activeVersion: number | null;
  };
  content: PricingGridContent;
};

/** `GET /pricing-grids` — la liste, **sans** `content`. */
export type PricingGridSummary = Omit<PricingGrid, 'content'>;

export type PricingGridListResponse = {
  data: PricingGridSummary[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};
