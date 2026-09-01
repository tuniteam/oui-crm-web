export const TABLE_HEADERS = {
  USER: 'Utilisateur',
  EMAIL: 'Email',
  ROLE: 'Rôle',
  STATUS: 'Statut',
  LAST_LOGIN: 'Dernière connexion',
  ACTIONS: 'Actions',
} as const;

export const ACTIONS = {
  NEW_OPERATOR: 'Nouvel opérateur',
  VIEW: "Voir l'opérateur",
  RESEND_ACTIVATION: "Renvoyer le lien d'activation",
  SUSPEND: "Suspendre l'accès",
} as const;

export const SEARCH = {
  PLACEHOLDER: 'Rechercher un opérateur…',
  TOOLTIP_TEXT: 'Recherche par e-mail, prénom ou nom',
  STATUS_PLACEHOLDER: 'Statut',
  ALL_STATUSES_SELECT_OPTION: 'Tous les statuts',
} as const;

export const EMPTY_STATE = {
  TITLE: 'Aucun opérateur',
  DESCRIPTION: [
    'Aucun compte back-office ne correspond à votre recherche.',
    'Créez un opérateur pour commencer.',
  ],
} as const;

export const CREATE_WINDOW = {
  TITLE: 'Créer un opérateur',
  DESCRIPTION:
    "Un e-mail d'activation lui sera envoyé pour définir son mot de passe.",
} as const;

export const EDIT_WINDOW = {
  TITLE: "Modifier l'opérateur",
} as const;

/**
 * DELETE suspend l'acces, il ne supprime pas le compte : la suspension est
 * reversible en recreant l'operateur avec le meme e-mail. Le libelle doit le
 * dire, sinon l'utilisateur croit a une suppression definitive.
 */
export const SUSPEND_WINDOW = {
  TITLE: "Suspendre l'accès",
  DESCRIPTION:
    "L'opérateur perdra l'accès à la plateforme et ses sessions seront fermées. L'accès peut être rétabli en le recréant avec la même adresse e-mail.",
  CONFIRM: 'Suspendre',
} as const;

export const FIELDS = {
  FIRST_NAME: 'Prénom',
  LAST_NAME: 'Nom',
  EMAIL: 'Email',
  ROLE: 'Rôle',
} as const;

export const PLACEHOLDERS = {
  FIRST_NAME: 'Prénom',
  LAST_NAME: 'Nom',
  EMAIL: 'email@exemple.com',
  ROLE: 'Sélectionner un rôle',
} as const;

export const ZOD = {
  REQUIRED: 'Champ requis',
  INVALID_EMAIL: 'Adresse email invalide',
  MAX_LENGTH: 'Maximum 100 caractères',
} as const;

export const ERRORS = {
  FETCH_USERS: 'Impossible de récupérer les opérateurs.',
  FETCH_ROLES: 'Impossible de charger les rôles.',
} as const;

export const TOASTS = {
  CREATED: 'Opérateur créé. Un e-mail d’activation lui a été envoyé.',
  UPDATED: 'Opérateur mis à jour.',
  SUSPENDED: 'Accès suspendu.',
  ACTIVATION_RESENT: "Lien d'activation renvoyé.",
} as const;

export const NOT_FOUND = {
  TITLE: 'Opérateur introuvable',
  DESCRIPTION:
    "Ce compte n'existe pas ou n'est pas un compte back-office.",
  BACK: 'Retour à la liste',
} as const;

export const FALLBACK = '—';
