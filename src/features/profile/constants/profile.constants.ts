export const PROFILE_ROUTES = {
  PROFILE_API: '/profile',
  PROFILE_ME_API: '/profile/me',
  PROFILE_PASSWORD_API: '/profile/change-password',
  PROFILE_AVATAR_API: '/profile/avatar',
} as const;

export const PROFILE_UI = {
  PAGE_TITLE: 'Mon profil',
  PAGE_SUBTITLE: 'Mon profil',

  SECTIONS: {
    PERSONAL_INFORMATION: 'Informations personnelles',
    AVATAR: 'Photo de profil',
    ACCESS: "Informations d'accès",
    SECURITY: 'Sécurité',
  },

  FIELDS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    PHONE: 'Numéro de téléphone',
    EMAIL: 'Email',
    ROLE: 'Rôle(s)',
    PASSWORD: 'Mot de passe',
  },

  BUTTONS: {
    EDIT: 'Modifier',
    CHANGE_PASSWORD: 'Modifier le mot de passe',
    CHANGE_PHOTO: 'Modifier la photo',
    CHANGE_EMAIL: "Modifier l'email",
  },

  TEXTS: {
    FALLBACK: '-',
    PASSWORD_MASK: '••••••••••••',
    READ_ONLY: 'lecture seule',
    CONTACT_ADMIN:
      'Contacter un administrateur pour modifier ces informations',
    AVATAR_CURRENT: 'Photo actuelle',
    AVATAR_FORMAT: 'Formats acceptés : JPG, PNG',
    AVATAR_MAX_SIZE: 'Taille maximale : 2 Mo',
    AVATAR_SQUARE: 'Image carrée recommandée',
    AVATAR_FALLBACK_INITIAL: 'U',
    CHANGE_PASSWORD_COMING_SOON: 'Fonctionnalité bientôt disponible',
  },

  STATUS_LABELS: {
    ACTIVE: 'ACTIF',
    INACTIVE: 'INACTIF',
    PENDING: 'EN ATTENTE',
    DRAFT: 'BROUILLON',
    SUSPENDED: 'SUSPENDU',
  } as Record<string, string>,

  ERRORS: {
    DEFAULT_FETCH: 'Impossible de charger le profil.',
  },

  SECURITY_CARD: {
    TITLE: 'Sécurité du compte',
    ITEMS: {
      STRONG_PASSWORD: 'Utilisez un mot de passe fort et unique',
      CHANGE_REGULARLY:
        'Changez-le régulièrement pour renforcer la sécurité',
    },
  },

  AVATAR_CARD: {
    TITLE: "Conditions de l’image",
  },
} as const;