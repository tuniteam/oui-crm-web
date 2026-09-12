/** Rôles d'un projet — L0 · US-00-06. Routes scopées projet (`x-project-id`). */
export const ROLE_ROUTES = {
  ROLES_API: '/roles',
  PERMISSIONS_API: '/permissions',
  DUPLICATE_API: (id: string) => `/roles/${id}/duplicate`,
  ROLE_API: (id: string) => `/roles/${id}`,
} as const;

/** Les règles du code d'un rôle, relevées dans `roles.constants.ts` de l'API. */
export const ROLE_RULES = {
  CODE_PATTERN: /^[A-Z][A-Z0-9_]*$/,
  CODE_MAX: 50,
  LABEL_MAX: 100,
} as const;

/** Codes d'erreur des routes de rôles, relevés dans le service de l'API. */
export const ROLE_ERROR_CODES = {
  /** 403 — rôle système, ou rôle d'un autre projet. */
  IS_SYSTEM: 'ROLE_IS_SYSTEM',
  /** 409 — code déjà pris dans le projet, ou par un rôle système. */
  CODE_EXISTS: 'ROLE_CODE_EXISTS',
  /** 409 — des utilisateurs portent encore ce rôle. */
  IN_USE: 'ROLE_IN_USE',
  NOT_FOUND: 'ROLE_NOT_FOUND',
} as const;

/**
 * Les modules du catalogue, en français.
 *
 * L'API renvoie `label` **en anglais** (« Validate quotes ») : elle nomme des
 * codes, pas des écrans. L'écran traduit donc depuis `module` et `action`, qui
 * sont structurés — et un module inconnu retombe sur sa clé, le catalogue
 * grandissant à chaque livraison.
 */
export const MODULE_LABELS: Record<string, string> = {
  organizations: 'Organismes',
  contacts: 'Contacts',
  activities: 'Actions commerciales',
  campaigns: 'Campagnes',
  opportunities: 'Opportunités',
  quotes: 'Devis',
  contracts: 'Contrats',
  invoices: 'Factures',
  deployments: 'Déploiements',
  trainings: 'Formations',
  tickets: 'Support',
  dashboard: 'Tableau de bord',
  stats: 'Statistiques',
  pricing: 'Grille tarifaire',
  settings: 'Paramètres du projet',
  references: 'Référentiels',
  users: 'Utilisateurs',
  userBackoffice: 'Comptes back-office',
  roles: 'Rôles et permissions',
  scopes: 'Périmètres',
  auditLog: 'Journal d’activité',
  data: 'Données du projet',
  projects: 'Projets de la plateforme',
};

/**
 * Les actions, en français.
 *
 * Le module donne le titre du groupe ; la ligne ne porte donc que l'action.
 * « Devis › Valider » se lit mieux que « Valider les devis » répété huit fois.
 */
export const ACTION_LABELS: Record<string, string> = {
  read: 'Consulter',
  create: 'Créer',
  update: 'Modifier',
  delete: 'Supprimer',
  export: 'Exporter',
  import: 'Importer',
  bulk: 'Actions groupées',
  submit: 'Soumettre',
  validate: 'Valider',
  sign: 'Signer',
  discountAboveCap: 'Accorder une remise au-delà du plafond',
  chorus: 'Enregistrer un dépôt Chorus Pro',
  restore: 'Restaurer',
  purge: 'Purger',
};

export const ROLES_UI = {
  TITLE: 'Rôles et permissions',
  SUBTITLE:
    'Chaque utilisateur porte un rôle dans ce projet. Les rôles système ne se modifient pas : dupliquez-en un pour l’adapter.',

  COLUMNS: {
    LABEL: 'Rôle',
    CODE: 'Code',
    KIND: 'Type',
    USERS: 'Utilisateurs',
    OUT_OF_SCOPE: 'Hors périmètre',
    ACTIONS: 'Actions',
  },

  KIND: {
    SYSTEM: 'Système',
    CUSTOM: 'Personnalisé',
  },

  /** Ce que voit un rôle hors de son périmètre géographique. */
  OUT_OF_SCOPE: {
    NONE: { LABEL: 'Rien', HINT: 'Ne voit aucune fiche hors de son périmètre.' },
    RESTRICTED: {
      LABEL: 'Lecture limitée',
      HINT: 'Voit une fiche hors périmètre, en lecture limitée.',
    },
    FULL: {
      LABEL: 'Sans restriction',
      HINT: 'Aucune restriction géographique.',
    },
  },

  /** Les trois états d'une case de la matrice. */
  SCOPE: {
    NONE: { LABEL: 'Aucun', HINT: 'Le droit n’est pas accordé.' },
    OWN: {
      LABEL: 'Ses fiches',
      HINT: 'Seulement les fiches dont l’utilisateur est responsable.',
    },
    PROJECT: { LABEL: 'Tout le projet', HINT: 'Toutes les fiches du projet.' },
  },

  ACTIONS: {
    VIEW: 'Voir les droits',
    DUPLICATE: 'Dupliquer',
    DELETE: 'Supprimer le rôle',
    SAVE: 'Enregistrer les droits',
    CANCEL: 'Annuler',
    EDIT: 'Modifier les droits',
  },

  /** Le tiroir d'un rôle. */
  DRAWER: {
    SYSTEM_NOTICE:
      'Rôle système, en lecture seule. Dupliquez-le pour créer un rôle modifiable à partir de ses droits.',
    OUT_OF_SCOPE_TITLE: 'Accès hors périmètre géographique',
    GRANTED: (n: number) =>
      n > 1 ? `${n} droits accordés` : `${n} droit accordé`,
    /** Le décompte d'un module, replié : ce qu'il contient sans l'ouvrir. */
    MODULE_COUNT: (granted: number, total: number) =>
      `${granted} / ${total}`,
    DIRTY: (n: number) =>
      `${n} modification${n > 1 ? 's' : ''} non enregistrée${n > 1 ? 's' : ''}`,
  },

  DUPLICATE_WINDOW: {
    TITLE: (label: string) => `Dupliquer « ${label} »`,
    LEAD: 'Le nouveau rôle reçoit les mêmes droits que celui-ci, et devient modifiable.',
    LABEL: 'Nom du rôle',
    CODE: 'Code',
    CODE_HINT:
      'Majuscules, chiffres et tirets bas. Définitif : il identifie le rôle et ne se modifie plus.',
    CONFIRM: 'Dupliquer',
    CANCEL: 'Annuler',
    DONE: (label: string) => `Rôle « ${label} » créé.`,
  },

  DELETE_WINDOW: {
    TITLE: (label: string) => `Supprimer « ${label} » ?`,
    LEAD: 'Ce rôle disparaît du projet. Les rôles système ne sont pas concernés.',
    CONFIRM: 'Supprimer',
    CANCEL: 'Annuler',
    DONE: 'Rôle supprimé.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les rôles.',
    REQUIRED: 'Ce champ est obligatoire.',
    TOO_LONG: (max: number) => `${max} caractères au maximum.`,
    CODE_FORMAT:
      'Majuscules, chiffres et tirets bas uniquement, en commençant par une lettre.',
    CODE_EXISTS: 'Ce code est déjà utilisé dans ce projet.',
    IS_SYSTEM: 'Ce rôle est un rôle système : il ne se modifie pas.',
    /**
     * Le refus du serveur, quand la liste affichée était périmée : on ne
     * connaît pas le nombre d'utilisateurs concernés, on ne l'invente pas.
     */
    IN_USE_ANY:
      'Ce rôle est encore attribué à des utilisateurs : réaffectez-les avant de le supprimer.',
    /** `usersCount` vient de la liste : on nomme le nombre, pas « des » utilisateurs. */
    IN_USE: (n: number) =>
      n > 1
        ? `Ce rôle est attribué à ${n} utilisateurs : réaffectez-les avant de le supprimer.`
        : `Ce rôle est attribué à ${n} utilisateur : réaffectez-le avant de le supprimer.`,
    NOT_FOUND: 'Ce rôle n’existe plus.',
    SAVE: 'Impossible d’enregistrer le rôle.',
    DUPLICATE: 'Impossible de dupliquer le rôle.',
  },
} as const;
