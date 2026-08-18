// src/features/users/constants/editUser.constants.ts

export const UPDATE_USER_SHEET = {
  TITLE: 'Modifier un utilisateur',
  LABELS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    STATUS: 'Statut',
    ROLE: 'Rôle',
  },
  PLACEHOLDERS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    STATUS: 'Sélectionner un statut',
    ROLE: 'Sélectionner un rôle',
  },
  LOADING_LABELS: {
    SAVING: 'Enregistrement...',
  },
  ACTIONS: {
    CANCEL: 'Annuler',
    SAVE: 'Enregistrer',
  },
} as const;
