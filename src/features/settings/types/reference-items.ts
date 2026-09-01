/** Catégories de référentiel. Source de vérité : contrat US-00-09. */
export const REFERENCE_CATEGORY_VALUES = [
  'STRUCTURE_TYPE',
  'TAG',
  'LEAD_SOURCE',
  'SERVICE',
  'ACTIVITY_TYPE',
  'ACTIVITY_RESULT',
  'TICKET_CATEGORY',
  'TRAINING_TYPE',
  'VENDOR',
  'SOLUTION',
  'LOSS_REASON',
] as const;

export type ReferenceCategory = (typeof REFERENCE_CATEGORY_VALUES)[number];

/**
 * Valeur de référentiel.
 *
 * `key` est immuable et unique dans sa catégorie ; la même clé peut exister
 * dans deux catégories. Les valeurs inactives restent dans la liste : à
 * masquer dans les sélecteurs, mais à afficher sur les fiches qui les portent.
 */
export type ReferenceItem = {
  id: string;
  category: ReferenceCategory;
  key: string;
  label: string;
  order: number;
  active: boolean;
  /** Attributs propres à la catégorie, remplacés en bloc à la mise à jour. */
  metadata: Record<string, unknown>;
  usageCount: number;
};

export type ReferenceItemsResponse = {
  data: ReferenceItem[];
};

export type CreateReferenceItemPayload = {
  category: ReferenceCategory;
  key: string;
  label: string;
  order?: number;
  metadata?: Record<string, unknown>;
};

/** `category` et `key` sont refusés par l'API : la clé ne se renomme pas. */
export type UpdateReferenceItemPayload = {
  label?: string;
  order?: number;
  active?: boolean;
  metadata?: Record<string, unknown>;
};
