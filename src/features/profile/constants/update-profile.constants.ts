export const UPDATE_PROFILE_SHEET = {
  TITLE: 'Modifier les informations personnelles',

  LABELS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    PHONE: 'Téléphone',
  },

  PLACEHOLDERS: {
    FIRST_NAME: 'Votre prénom',
    LAST_NAME: 'Votre nom',
    PHONE: 'Votre numéro de téléphone',
  },

  BUTTONS: {
    CANCEL: 'Annuler',
    SAVE: 'Enregistrer',
  },

  LOADING_LABELS: {
    SAVING: 'Enregistrement...',
  },

  TOASTS: {
    SUCCESS: 'Profil mis à jour avec succès',
    ERROR: 'Impossible de mettre à jour le profil',
  },

  ERRORS: {
    FIRST_NAME_REQUIRED: 'Prénom requis',
    LAST_NAME_REQUIRED: 'Nom requis',
    FIRST_NAME_MAX: 'Maximum 100 caractères',
    LAST_NAME_MAX: 'Maximum 100 caractères',
    PHONE_MAX: 'Maximum 30 caractères',
    PHONE_INVALID: 'Numéro de téléphone français invalide',
  },
} as const;
