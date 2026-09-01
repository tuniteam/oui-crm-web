import type { ReferenceCategory } from '../types/reference-items';

/** Libellés des catégories, dans l'ordre d'affichage de la maquette V8. */
export const REFERENCE_CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  STRUCTURE_TYPE: 'Types de structure',
  SOLUTION: 'Solutions concurrentes',
  VENDOR: 'Éditeurs',
  LEAD_SOURCE: 'Origines des opportunités',
  ACTIVITY_TYPE: 'Types d’action commerciale',
  ACTIVITY_RESULT: 'Résultats d’action',
  LOSS_REASON: 'Motifs de perte',
  SERVICE: 'Services',
  TICKET_CATEGORY: 'Catégories de ticket',
  TRAINING_TYPE: 'Types de formation',
  TAG: 'Étiquettes',
};

/** Ordre des blocs à l'écran, du plus structurant au plus accessoire. */
export const REFERENCE_CATEGORY_ORDER: ReferenceCategory[] = [
  'STRUCTURE_TYPE',
  'VENDOR',
  'SOLUTION',
  'LEAD_SOURCE',
  'ACTIVITY_TYPE',
  'ACTIVITY_RESULT',
  'LOSS_REASON',
  'SERVICE',
  'TICKET_CATEGORY',
  'TRAINING_TYPE',
  'TAG',
];

export const REFERENCES_UI = {
  TITLE: 'Référentiels',
  DESCRIPTION:
    'Les valeurs proposées dans les listes déroulantes de l’application. Une valeur utilisée ne se supprime pas : elle se désactive.',
  EMPTY_CATEGORY: 'Aucune valeur dans cette catégorie.',
  EMPTY_SEARCH: 'Aucune valeur ne correspond à la recherche.',
  CATEGORY_LABEL: 'Catégorie',
  SEARCH_PLACEHOLDER: 'Rechercher une valeur…',
  REORDER_HINT: 'Glissez une ligne pour changer l’ordre des listes déroulantes.',
  REORDER_LOCKED: 'Effacez la recherche pour pouvoir réordonner.',
  COUNTS: (total: number, inactive: number) =>
    `${total} valeur${total > 1 ? 's' : ''}` +
    (inactive > 0 ? ` · ${inactive} inactive${inactive > 1 ? 's' : ''}` : ''),
  DRAG_HANDLE: 'Déplacer',
  RENAME: 'Renommer',
  RANK: (n: number) => `Rang ${n}`,
  INACTIVE: 'Inactive',
  INACTIVE_HINT:
    'Les valeurs inactives restent visibles ici et sur les fiches qui les portent, mais disparaissent des listes de choix.',
  USAGE: (n: number) => `${n} utilisation${n > 1 ? 's' : ''}`,

  ACTIONS: {
    ADD: 'Ajouter une valeur',
    EDIT: 'Modifier',
  },

  CREATE_WINDOW: {
    TITLE: 'Nouvelle valeur',
    DESCRIPTION:
      'La clé est immuable : elle identifie la valeur dans le code et ne pourra plus être changée.',
  },

  FIELDS: {
    CATEGORY: 'Catégorie',
    KEY: 'Clé',
    LABEL: 'Libellé',
    ORDER: 'Ordre',
    ACTIVE: 'Active',
    METADATA: 'Attributs',
  },

  PLACEHOLDERS: {
    KEY: 'TRADE_SHOW',
    LABEL: 'Salon professionnel',
  },

  HINTS: {
    KEY: 'Majuscules, chiffres et tirets bas. 60 caractères maximum.',
    ORDER: 'La valeur est ajoutée en fin de liste ; l’ordre se règle ensuite au glisser-déposer.',
    METADATA: 'Attributs propres à la catégorie, gérés côté serveur.',
  },

  ZOD: {
    REQUIRED: 'Champ requis',
    KEY_FORMAT: 'Format attendu : MAJUSCULES_ET_TIRETS_BAS',
    KEY_MAX: 'Maximum 60 caractères',
    LABEL_MAX: 'Maximum 150 caractères',
    ORDER_POSITIVE: 'Nombre entier positif',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les référentiels.',
    KEY_EXISTS: 'Cette clé existe déjà dans la catégorie.',
  },

  TOASTS: {
    CREATED: 'Valeur ajoutée.',
    UPDATED: 'Valeur mise à jour.',
    REORDERED: 'Ordre enregistré.',
  },
} as const;
