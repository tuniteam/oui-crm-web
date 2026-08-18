export const RESET_PASSWORD = {
  INVALID_TOKEN: {
    TITLE: {
      EXPIRED: 'Lien expiré',
      INVALID: 'Lien invalide',
    },
    DESCRIPTION: {
      EXPIRED: 'Ce lien de réinitialisation a expiré ou a déjà été utilisé.',
      INVALID: 'Ce lien de réinitialisation est invalide.',
    },
    WHY: {
      TITLE: 'Pourquoi ce message ?',
      EXPIRES_AFTER: 'Le lien de réinitialisation expire après 1 heure',
      SINGLE_USE: "Chaque lien ne peut être utilisé qu'une seule fois",
    },
    ACTIONS: {
      NEW_REQUEST: 'Faire une nouvelle demande',
      BACK_TO_LOGIN: 'Retour à la connexion',
    },
    FOOTER: 'Si le problème persiste, contactez votre administrateur.',
  },

  PASSWORD_CHANGED: {
    TITLE: 'Mot de passe modifié',
    DESCRIPTION:
      'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    ACTIONS: {
      LOGIN: 'Se connecter',
    },
  },

  REQUEST: {
    TITLE: 'Mot de passe oublié',
    DESCRIPTION:
      'Saisissez votre email. Vous recevrez un lien de réinitialisation valable 1 heure.',
    FORM: {
      EMAIL_LABEL: 'Adresse email',
      EMAIL_PLACEHOLDER: 'nom@exemple.fr',
    },
    ACTIONS: {
      SEND_LINK: 'Envoyer le lien',
      SENDING: 'Envoi...',
      BACK_TO_LOGIN: 'Retour à la connexion',
    },
    ERRORS: {
      GENERIC: 'Une erreur est survenue. Veuillez réessayer.',
    },
  },

  REQUEST_SUCCESS: {
    TITLE: 'Vérifiez votre boîte email',
    DESCRIPTION:
      'Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation valable 1 heure.',
    INFO: {
      SPAM: '💡 Pensez à vérifier vos spams.',
      EXPIRES: 'Le lien expire dans 1 heure après envoi.',
    },
    ACTIONS: {
      BACK_TO_LOGIN: 'Retour à la connexion',
    },
  },

  FORM: {
    ERROR_UNKNOWN: 'Une erreur est survenue. Veuillez réessayer.',
    TITLE: 'Nouveau mot de passe',
    DESCRIPTION: 'Définissez votre nouveau mot de passe.',
    FIELDS: {
      PASSWORD_LABEL: 'Nouveau mot de passe',
      CONFIRM_PASSWORD_LABEL: 'Confirmer le mot de passe',
      PASSWORD_PLACEHOLDER: '********',
      CONFIRM_PASSWORD_PLACEHOLDER: '********',
    },
    ACTIONS: {
      SUBMIT: 'Valider le mot de passe',
      SUBMITTING: 'Validation...',
    },
  },
} as const;