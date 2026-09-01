// src/features/users/constants/constants.ts
import { STATUS_CONFIG } from '@/components/shared/status-config';

import { UserStatus } from '../types/userList';

// ==============================
// STATUS VALUES (source de vérité)
// ==============================
/**
 * Statut composite (US-00-05) : etat du compte (PENDING/ACTIVE/INACTIVE) ou
 * affectation suspendue sur ce projet (SUSPENDED). Meme valeur pour le filtre.
 */
export const USER_STATUS_VALUES = [
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
] as const;

// Accès nommé aux valeurs de statut (pour les comparaisons en logique métier).
// `satisfies Record<string, UserStatus>` => une valeur invalide est rejetée par TS.
export const USER_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const satisfies Record<string, UserStatus>;

// ==============================
// TABLE HEADERS
// ==============================
export const TABLE_HEADERS = {
  USER: 'Utilisateur',
  EMAIL: 'Email',
  ROLE: 'Rôle',
  STATUS: 'Statut',
  SCOPE: 'Périmètre',
  ACTIONS: 'Actions',
} as const;

/** Marqueur d'un acces a duree limitee (`expiresAt` renseigne cote serveur). */
export const EXTERNAL_BADGE = 'Externe';

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
/**
 * Options des filtres. Les libelles derivent de STATUS_CONFIG, qui pilote deja
 * les badges de toute l'application : une seule source pour le badge et pour
 * le filtre.
 */
export const USER_STATUS_LABELS: { value: UserStatus; label: string }[] =
  USER_STATUS_VALUES.map((value) => ({
    value,
    label: STATUS_CONFIG[value]?.label ?? value,
  }));

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
      'Aucun utilisateur trouvé pour ce projet.',
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
