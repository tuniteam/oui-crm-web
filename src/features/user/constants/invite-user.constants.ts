import type { UserStatus } from '../types/userList';

export const INVITABLE_STATUSES: readonly UserStatus[] = ['DRAFT', 'PENDING'] as const;

export const INVITE_USER_CARD = {
  TITLE: 'Invitation',
  DESCRIPTION_DRAFT:
    "Envoyer une invitation à cet utilisateur pour qu'il active son compte",
  DESCRIPTION_PENDING: "Renvoyer l'invitation à cet utilisateur",
  BUTTON_DRAFT: 'Inviter',
  BUTTON_PENDING: "Relancer l'invitation",
  TOASTS: {
    SUCCESS: 'Invitation envoyée avec succès',
    ERROR: "Impossible d'envoyer l'invitation",
  },
} as const;
