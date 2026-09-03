/**
 * Perimetres d'un projet — US-00-07.
 *
 * Un perimetre est du **controle d'acces** : il decide de ce qu'un utilisateur
 * voit dans la base d'organismes. Trois axes se combinent par **intersection**,
 * jamais par addition — geographie, portefeuille personnel, nature des fiches.
 */

/** Nature des fiches couvertes. */
export const SCOPE_NATURES = ['ALL', 'PROSPECTS', 'CUSTOMERS'] as const;
export type ScopeNature = (typeof SCOPE_NATURES)[number];

export type Scope = {
  id: string;
  name: string;
  description: string | null;
  /** Regions cochees en entier. Le serveur les deplie lui-meme. */
  regions: string[];
  /** Departements ajoutes un a un, hors des regions entieres. */
  departments: string[];
  /** Restreint aux fiches dont l'utilisateur est l'affecte. */
  portfolioOnly: boolean;
  nature: ScopeNature;
  /**
   * Campagnes rattachees — champ ajoute au L1 avec les campagnes, absent du
   * contrat L0 d'origine. Une campagne citee ici ne peut pas etre supprimee.
   */
  campaignIds: string[];
  /**
   * Affectations **actives** seulement.
   *
   * Attention : le garde-fou de suppression, cote serveur, compte *toutes* les
   * affectations, suspendues comprises. Un perimetre a `usersCount: 0` peut
   * donc voir sa suppression refusee. L'ecart est signale dans
   * `docs/ETUDE-PERIMETRES.md`.
   */
  usersCount: number;
  /**
   * Regions depliees + departements explicites, dedoublonnes et tries, rendus
   * par le serveur. **Vide signifie tout le territoire**, pas aucun
   * departement — jamais recalcule cote front.
   */
  resolvedDepartments: string[];
};

export type ScopesResponse = { data: Scope[] };

/** Une region et les departements qu'elle couvre. Table statique de 14 lignes. */
export type GeoRegion = {
  name: string;
  departments: string[];
};

export type GeoRegionsResponse = { data: GeoRegion[] };

/** Corps de creation. Les listes absentes valent « vide ». */
export type CreateScopePayload = {
  name: string;
  description?: string;
  regions?: string[];
  departments?: string[];
  portfolioOnly?: boolean;
  nature?: ScopeNature;
};

/**
 * Corps de modification.
 *
 * Les listes sont **remplacees en bloc**, jamais fusionnees : poster `regions`
 * sans `departments` efface les departements explicites. Le formulaire envoie
 * donc toujours l'etat complet des deux.
 */
export type UpdateScopePayload = Partial<CreateScopePayload> & {
  campaignIds?: string[];
};
