export const CREATE_USER_SHEET = {
  TITLE: 'Créer un utilisateur',
  LABELS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    EMAIL: 'Email',
    ROLE: 'Rôle',
  },
  PLACEHOLDERS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    EMAIL: 'email@exemple.com',
    ROLE: 'Sélectionner un rôle',
  },
  LOADING_LABELS: {
    CREATING: 'Création...',
  },
  ROLES: {
    ERROR: 'Impossible de charger les rôles',
    NO_ROLE: 'Aucun rôle disponible',
    CANNOT_EDIT: 'Vous ne pouvez pas modifier votre propre rôle.',
  },
} as const;

export const TOASTS = {
  USER_CREATED: 'Utilisateur créé',
  CREATE_USER_ERROR: 'Erreur création utilisateur',
  SLOT_ASSIGNED: 'Le créneau a été assigné à la structure',
  SLOT_UNASSIGNED: 'Le créneau a été désassigné de la structure',
  TOGGLE_SLOT_ERROR: 'Erreur lors de la mise à jour du périmètre',
  USER_STRUCTURE_REMOVED: 'La structure a été retirée du périmètre',
  REMOVE_USER_STRUCTURE_ERROR: 'Erreur lors de la suppression de la structure',
  STRUCTURE_ASSIGNED_SUCCESS: 'Structure assignée avec succès',
} as const;

export const ZOD_ERRORS = {
  REQUIRED: 'Champ requis',
  INVALID_EMAIL: 'Email invalide',
  INVALID_AMOUNT: 'Montant invalide',
  MIN_LENGTH: 'Longueur minimale invalide',
  MAX_LENGTH: 'Longueur maximale dépassée',
  STRUCTURE_REQUIRED: 'Établissement requis',
} as const;

export const USER_INFORMATION_UI = {
  TABS: {
    INFORMATION: {
      VALUE: 'informations',
      LABEL: 'Informations',
    },
    PERIMETRE: {
      VALUE: 'perimetre',
      LABEL: 'Périmètre',
    },
  },
  SECTIONS: {
    IDENTITY: 'Identité',
    ACCESS: 'Accès',
    SECURITY: 'Sécurité',
    METADATA: 'Informations système',
  },

  FIELDS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    EMAIL: 'Email',

    STATUS: 'Statut',
    ROLE: 'Rôle',
    RELATION_STATUS: 'Statut relation',

    CONTACT_TYPE: 'Type de contact',
    LAST_LOGIN: 'Dernière connexion',
    FAILED_ATTEMPTS: 'Tentatives échouées',

    CREATED_AT: 'Créé le',
    UPDATED_AT: 'Modifié le',
  },

  FALLBACK: '-',
} as const;

export const USER_PERIMETRE_UI = {
  SECTION_TITLE: 'Structures et créneaux assignés',
  PREFIX: 'Structure :',
  PRESTATION_PREFIX: 'Prestation :',

  ACTIONS: {
    REMOVE_STRUCTURE: 'Retirer',
    ADD_STRUCTURE: 'Ajouter une structure',
  },

  EMPTY_STATE: {
    NO_STRUCTURES: 'Aucune structure assignée à cet utilisateur',
    NO_STRUCTURES_DESCRIPTION:
      "Cet utilisateur n'est actuellement rattaché à aucune structure",
    NO_PRESTATIONS: 'Aucune prestation disponible',
    NO_PRESTATIONS_DESCRIPTION:
      'Cette structure ne possède aucune prestation associée',

    NO_SLOTS: 'Aucun créneau disponible',
    NO_SLOTS_DESCRIPTION: 'Cette prestation ne possède aucun créneau associé',
  },

  SLOT: {
    LABEL: 'Créneau',
    TIME: 'Horaire',
  },
} as const;

export const USER_PERIMETRE_DIALOGS = {
  REMOVE_STRUCTURE: {
    TITLE: 'Retirer la structure',
    DESCRIPTION:
      'Êtes-vous sûr de vouloir retirer cette structure du périmètre utilisateur ?',
    CANCEL: 'Annuler',
    CONFIRM: 'Supprimer',
  },
  ADD_STRUCTURE: {
    TITLE: 'Ajouter une structure',
    SELECT_LABEL: 'Structure',
    SELECT_PLACEHOLDER: 'Sélectionner une structure…',
    CANCEL: 'Annuler',
    CONFIRM: 'Enregistrer',
    NO_AVAILABLE_STRUCTURES: 'Aucune structure disponible',
    LOADING: 'Enregistrement...',
  },
} as const;
