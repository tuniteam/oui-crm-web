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
    /** 200 avec `sent: false` : la route a repondu, le SMTP n'a pas suivi. */
    NOT_SENT:
      "L'invitation n'a pas pu partir : le service d'envoi n'a pas répondu. Réessayez dans un moment.",
  },
} as const;
