// features/auth/constants/auth.constants.ts
export const AUTH = {
  UI: {
      COPYRIGHT: (year: number) =>
    `© ${year} Oui Crm`,
    TITLE: 'Connexion',
    SUBTITLE: 'Bienvenue ! Connectez-vous avec vos identifiants.',

    LABELS: {
      EMAIL: 'Email',
      PASSWORD: 'Mot de passe',
      REMEMBER: 'Se souvenir de moi',
    },

    PLACEHOLDERS: {
      EMAIL: 'exemple@mairie.fr',
      PASSWORD: '••••••••',
    },

    ACTIONS: {
      SUBMIT: 'Se connecter',
      LOADING: 'Connexion...',
      FORGOT_PASSWORD: 'Mot de passe oublié ?',
    },

    BANNERS: {
      ACCOUNT_DISABLED:
        'Votre compte a été désactivé. Contactez votre administrateur.',
    },

    LOGO_ALT: 'OUI-CRM',
  },

  ZOD: {
    REQUIRED: 'Champ requis',
    INVALID_EMAIL: 'Adresse email invalide',
  },

  BRANDING: {
    TITLE: 'Accès sécurisé',
    DESCRIPTION: [
      'Portail d’authentification sécurisé pour accéder à votre',
      'espace de gestion en toute confiance.',
    ],
    HIGHLIGHT: 'rapide et protégé',
  },

  ERRORS: {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
    ACCOUNT_LOCKED:
      'Trop de tentatives. Votre compte est temporairement bloqué.',
    ACCOUNT_LOCKED_UNTIL: (delay: string) =>
      `Trop de tentatives. Réessayez dans ${delay}.`,
    ACCOUNT_NOT_ACTIVE:
      "Votre compte n'est pas actif. Contactez votre administrateur.",
    SERVER: 'Une erreur est survenue. Veuillez réessayer.',
    NO_REFRESH_TOKEN: 'Refresh Token non existant',
    NO_ACCESS_TOKEN: 'Access Token non existant',
  },
} as const;
