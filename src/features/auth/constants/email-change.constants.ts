// features/auth/constants/email-change.constants.ts
import { AUTH } from './auth.constants';

/** Single source of truth for the "invalid email format" message. */
const EMAIL_INVALID = "Format d'email invalide.";

export const EMAIL_CHANGE = {
  REQUEST: {
    TITLE: 'Modifier mon email',
    DESCRIPTION:
      'Saisissez votre nouvelle adresse. Un lien de confirmation vous y sera envoyé.',

    LABELS: {
      NEW_EMAIL: 'Nouvel email',
      CURRENT_PASSWORD: 'Mot de passe actuel',
    },

    PLACEHOLDERS: {
      NEW_EMAIL: 'nouveau@exemple.fr',
      CURRENT_PASSWORD: '••••••••',
    },

    HINT: 'Pour des raisons de sécurité, confirmez votre mot de passe actuel.',

    BUTTONS: {
      CANCEL: 'Annuler',
      CONFIRM: 'Confirmer',
      CLOSE: 'Fermer',
    },

    LOADING: 'Envoi en cours...',

    SUCCESS: {
      TITLE: 'Lien de confirmation envoyé',
      DESCRIPTION: (email: string) =>
        `Un lien de confirmation a été envoyé à ${email}. Cliquez dessus dans les 30 minutes pour valider le changement.`,
    },

    ERRORS: {
      EMAIL_UNCHANGED: "C'est déjà votre adresse actuelle.",
      INVALID_DATA: EMAIL_INVALID,
      AUTH_INVALID_CREDENTIALS: 'Mot de passe incorrect.',
      USER_INACTIVE: "Votre compte n'est pas actif.",
      EMAIL_ALREADY_TAKEN: 'Cet email est déjà utilisé par un autre compte.',
      UNKNOWN: AUTH.ERRORS.SERVER,
    },
  },

  CONFIRM: {
    LOADING: 'Confirmation en cours…',

    SUCCESS: {
      TITLE: 'Email modifié',
      DESCRIPTION: (email: string) =>
        `Votre email a été modifié vers ${email}.`,
    },

    ERROR_TITLE: 'Confirmation impossible',

    ERRORS: {
      EMAIL_CHANGE_TOKEN_REQUIRED: 'Lien invalide.',
      EMAIL_CHANGE_TOKEN_NOT_FOUND:
        'Ce lien a été remplacé par une demande plus récente, ou est invalide.',
      EMAIL_CHANGE_TOKEN_EXPIRED:
        'Ce lien a expiré (valable 30 minutes). Refaites une demande.',
      EMAIL_ALREADY_TAKEN:
        "Cet email vient d'être pris par un autre compte.",
      UNKNOWN: AUTH.ERRORS.SERVER,
    },

    ACTIONS: {
      LOGIN: 'Se reconnecter',
    },
  },

  SCHEMA: {
    REQUIRED: AUTH.ZOD.REQUIRED,
    NEW_EMAIL_INVALID: EMAIL_INVALID,
  },
} as const;
