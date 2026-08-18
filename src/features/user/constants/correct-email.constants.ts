// src/features/user/constants/correct-email.constants.ts
import { ERRORS } from './userList.constants';

/** Source unique pour le message "email invalide" (schéma + erreur API). */
const EMAIL_INVALID = "Format d'email invalide.";

export const CORRECT_EMAIL = {
  CARD: {
    TITLE: 'Email du compte',
    DESCRIPTION:
      "Corriger l'adresse email tant que le compte n'est pas activé.",
    BUTTON: "Corriger l'email",
  },

  DIALOG: {
    TITLE: "Corriger l'email",
    DESCRIPTION: 'Saisissez la nouvelle adresse email de ce compte non activé.',
    LABEL: 'Email',
    PLACEHOLDER: 'correct@exemple.fr',
    HINT_PENDING:
      "Un nouvel email d'activation sera envoyé à la nouvelle adresse.",
    BUTTONS: {
      CANCEL: 'Annuler',
      CONFIRM: "Corriger l'email",
    },
    LOADING: 'Correction...',
  },

  DISABLED_TOOLTIP: 'Le titulaire modifie son email depuis son profil.',

  TOASTS: {
    SUCCESS: 'Email corrigé.',
    SUCCESS_PENDING: (email: string) =>
      `Un nouvel email d'activation a été envoyé à ${email}.`,
  },

  ERRORS: {
    EMAIL_UNCHANGED: "C'est déjà l'email actuel.",
    INVALID_DATA: EMAIL_INVALID,
    EMAIL_ALREADY_TAKEN: 'Cet email est déjà utilisé par un autre compte.',
    USER_CLIENT_NOT_FOUND: 'Utilisateur introuvable.',
    USER_ACTIVE_EMAIL_SELF_SERVICE:
      "Ce compte est activé : l'email se modifie depuis le profil.",
    UNKNOWN: ERRORS.API_GENERIC,
  },

  SCHEMA: {
    EMAIL_REQUIRED: 'Champ requis',
    EMAIL_INVALID,
  },
} as const;
