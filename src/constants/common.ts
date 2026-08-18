/**
 * Constantes partagées cross-feature
 * Déplacées ici pour éviter les imports cross-feature
 */
export const FR_PHONE_REGEX = /^(\+33|0)[1-9](\s?[0-9]{2}){4}$/;

export const COMMON = {
  NO_DATA_AVAILABLE: 'Aucune donnée trouvée',
  INVALID_DATA: 'Données invalides',
  UNAUTHORIZED: 'Accès non autorisé',
  ACCESS_DENIED: 'Accès refusé',
  //Generic error for the fetching
  FETCH_ERROR: 'Impossible de charger les données',
  GENERIC_ERROR: 'Une erreur est survenue',

  // Pour remplacer "Loading..." anglais dans data-grid-table.tsx:436
  LOADING: 'Chargement...',

  VALIDATION: {
    PHONE_INVALID: 'Numéro français à 10 chiffres (ex: 0612345678)',
  },

  PERIOD: {
    OPEN_ENDED_PREFIX: 'Depuis le',
    RANGE_PREFIX: 'Du',
    RANGE_SEPARATOR: 'au',
  },

  //Actions
  ACTIONS: {
    VIEW: 'Voir',
    EDIT: 'Modifier',
    DELETE: 'Supprimer',
    MANAGE: 'Gérer',
    BACK: 'Retour',
    CANCEL: 'Annuler',
    CREATE: 'Créer',
    SAVE: 'Enregistrer',
    DELETING: 'Suppression...',
    COPY: 'Copier',
    COPIED: 'Copié',
    COPY_EMAIL: "Copier l'email",
    EMAIL_COPIED: 'Email copié',
    OPEN_IN_NEW_TAB: 'Ouvrir dans un nouvel onglet',
    PROFILE: 'Profil',
    LOGOUT: 'Déconnexion',
  },
} as const;

// --- Jours de la semaine (partagés cross-feature) ---

export const DAY_OF_WEEK_VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche',
};

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'Me',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};
