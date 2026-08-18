// src/features/auth/constants/activation.constants.ts

export const ACTIVATION = {
  DIALOG: {
    TITLE_LOADING: 'Activation',
    DESC_LOADING: "Vérification du lien d'activation...",

    TITLE_VALID: 'Activation de votre compte',
    DESC_VALID: '',

    TITLE_EXPIRED: 'Lien expiré',
    DESC_EXPIRED: '',

    TITLE_INVALID: 'Lien invalide',
    DESC_INVALID: '',

    TITLE_SUCCESS: 'Compte activé',
    DESC_SUCCESS: 'Vous pouvez maintenant continuer.',
  },

  CREATE_PASSWORD: {
    ERROR_UNKNOWN: "Erreur inconnue",
    TITLE: 'Activation de votre compte',
    SUBTITLE: 'Bienvenue ! Finalisez votre inscription pour accéder à Oui Crm.',
    LABELS: {
      PASSWORD: 'Mot de passe',
      CONFIRM_PASSWORD: 'Confirmer le mot de passe',
      CGU: "J'accepte les Conditions Générales d'Utilisation",
      RGPD: "J'accepte le traitement de mes données (RGPD)",
    },
    PLACEHOLDERS: {
      PASSWORD: '********',
      CONFIRM_PASSWORD: '********',
    },
    BUTTONS: {
      SUBMIT: 'Valider',
      SUBMIT_LOADING: 'Validation...',
    },
    FOOTER:
      "Ce lien d'activation expire dans 72 heures. Contactez votre administrateur si besoin.",
  },

  INVALID_TOKEN: {
    EXPIRED: {
      TITLE: 'Lien expiré',
      DESCRIPTION:
        "Ce lien d'activation a expiré. Les liens sont valables 72 heures après envoi.",
      HELPER: 'Un nouveau lien a été envoyé. Vérifiez votre boîte e-mail.',
    },
    INVALID: {
      TITLE: 'Lien invalide',
      DESCRIPTION:
        "Ce lien d'activation est invalide. Vérifiez que vous utilisez le dernier email reçu.",
      HELPER: '',
    },
    BUTTON_BACK: 'Retour à la connexion',
  },

  CONTINUE: {
    TITLE: 'Compte activé',
    SUBTITLE:
      'Votre mot de passe a été enregistré. Vous pouvez continuer.',
    BUTTON: 'Continuer',
    BUTTON_LOADING: 'Connexion...',
    ERROR_FALLBACK: 'Erreur serveur',
  },
  SCHEMA: {
    PASSWORD: {
      REQUIRED: 'Champ requis',
      MIN: 'Minimum 8 caractères',
      UPPER: 'Au moins 1 majuscule',
      LOWER: 'Au moins 1 minuscule',
      NUMBER: 'Au moins 1 chiffre',
      SPECIAL: 'Au moins 1 caractère spécial',
      MATCH: 'Les mots de passe ne correspondent pas',
    },
    CGU_REQUIRED: 'Vous devez accepter les CGU',
    RGPD_REQUIRED: 'Vous devez accepter le RGPD',
  },

  PASSWORD_VALIDATORS: {
    TITLE: 'Critères du mot de passe',
    STRENGTH: {
      EMPTY: 'Commencez à saisir votre mot de passe',
      WEAK: 'Faible',
      MEDIUM: 'Moyen',
      STRONG: 'Fort',
    },
    RULES: {
      MIN: 'Min. 8 caractères',
      UPPER: 'Au moins 1 majuscule (A-Z)',
      LOWER: 'Au moins 1 minuscule (a-z)',
      NUMBER: 'Au moins 1 chiffre (0-9)',
      SPECIAL: 'Au moins 1 caractère spécial',
    },
  },
} as const;