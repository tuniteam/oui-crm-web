// src/features/users/constants/constants.ts

import { RelationshipStatus, UserStatus } from '../types/userList';

// ==============================
// STATUS VALUES (source de vérité)
// ==============================
export const USER_STATUS_VALUES = [
  'DRAFT',
  'ACTIVE',
  'PENDING',
  'INACTIVE',
] as const;

// Accès nommé aux valeurs de statut (pour les comparaisons en logique métier).
// `satisfies Record<string, UserStatus>` => une valeur invalide est rejetée par TS.
export const USER_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
} as const satisfies Record<string, UserStatus>;

// ==============================
// TABLE HEADERS
// ==============================
export const TABLE_HEADERS = {
  USER: 'Utilisateur',
  EMAIL: 'Email',
  ROLE: 'Rôle',
  STATUS: 'Statut',
  ACTIONS: 'Actions',
} as const;

// ==============================
// ACTION LABELS
// ==============================
export const ACTIONS = {
  NEW_USER: 'Nouvel utilisateur',
} as const;

// ==============================
// SEARCH
// ==============================
export const SEARCH = {
  PLACEHOLDER: 'Rechercher...',
  ROLE_PLACEHOLDER: 'Rôle',
  STATUS_PLACEHOLDER: 'Statut',
  ALL_ROLES_SELECT_OPTION: 'Tous les rôles',
  ALL_STATUSES_SELECT_OPTION: 'Tous les statuts',
} as const;

// ==============================
// STATUS LABELS (Prisma UserStatus)
// ==============================
export const USER_STATUS_LABELS: { value: UserStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'INACTIVE', label: 'Inactif' },
] as const;

export const RELATIONSHIP_STATUS_LABELS: {
  value: RelationshipStatus;
  label: string;
}[] = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
] as const;

// ==============================
// ERROR MESSAGES
// ==============================
export const ERRORS = {
  // generic
  API_GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
  UNAUTHORIZED: 'Accès non autorisé',
  RATE_LIMIT: 'Trop de requêtes, veuillez réessayer plus tard',
  SERVER_UNAVAILABLE: 'Service indisponible, veuillez réessayer',

  // list users
  FETCH_USERS: 'Impossible de charger la liste des utilisateurs',
  USERS_INVALID_REQUEST: 'Requête invalide',
  USERS_NOT_FOUND: 'Utilisateurs introuvables',
} as const;

// ==============================
// TABLE EMPTY UI
// ==============================
export const SEARCH_TOOLTIP_TEXT = 'Rechercher par nom, prénom ou e-mail.';

export const USERS_TABLE_UI = {
  EMPTY_STATE: {
    TITLE: 'Aucun utilisateur',
    DESCRIPTION: [
      'Aucun utilisateur trouvé pour ce client.',
      'Ajoutez un utilisateur pour commencer.',
    ],
    TIP: {
      TITLE: 'Conseil',
      CONTENT: [
        'Les utilisateurs permettent de gérer les accès et les rôles.',
        'Vous pouvez filtrer par statut et par rôle.',
      ],
    },
  },
} satisfies {
  EMPTY_STATE: {
    TITLE: string;
    DESCRIPTION: string[];
    TIP: {
      TITLE: string;
      CONTENT: string[];
    };
  };
};
