import type { UserStatus } from '../types/userList';

// Le renvoi d'activation n'a de sens que sur un compte PENDING : tout autre
// statut repond 409 USER_ALREADY_ACTIVE (US-00-05).
export const INVITABLE_STATUSES: readonly UserStatus[] = ['PENDING'] as const;

export const INVITE_USER_CARD = {
  TITLE: 'Invitation',
  DESCRIPTION_PENDING: "Renvoyer l'invitation à cet utilisateur",
  BUTTON_PENDING: "Relancer l'invitation",
  TOASTS: {
    SUCCESS: 'Invitation envoyée avec succès',
    ERROR: "Impossible d'envoyer l'invitation",
  },
} as const;
