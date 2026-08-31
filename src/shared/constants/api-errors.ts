// src/constants/api-errors.ts

export const API_ERROR = {
  // ==============================
  // Auth / Sécurité
  // ==============================
  TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  UNAUTHORIZED: 'Accès non autorisé.',
  ACCESS_DENIED:
    'Accès refusé. Vous n’êtes pas autorisé à effectuer cette action.',
  AUTH_INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
  AUTH_ACCOUNT_LOCKED: 'Votre compte est temporairement bloqué.',
  AUTH_ACCOUNT_NOT_ACTIVE:
    "Votre compte n'est pas actif. Contactez votre administrateur.",
  AUTH_USER_NOT_FOUND: 'Utilisateur introuvable.',

  JWT_ACCESS_SECRET_MISSING:
    'Configuration du serveur invalide. Veuillez contacter l’administrateur.',

  // Refresh / Session
  REFRESH_TOKEN_INVALID_OR_USED:
    'Le jeton de rafraîchissement est invalide ou déjà utilisé.',
  REFRESH_TOKEN_INVALID_OR_EXPIRED:
    'Le jeton de rafraîchissement est invalide ou expiré.',
  REFRESH_TOKEN_EXPIRED: 'Le jeton de rafraîchissement a expiré.',
  REFRESH_TOKEN_REQUIRED: 'Le jeton de rafraîchissement est requis.',
  SESSION_NOT_FOUND: 'Session introuvable.',
  SESSION_REVOKED_OR_EXPIRED: 'La session a été révoquée ou a expiré.',

  // ==============================
  // Validation / Générique
  // ==============================
  INVALID_DATA: 'Données invalides.',
  INVALID_CUID: 'Identifiant invalide.',
  INVALID_DATE_RANGE: 'La date de début doit être antérieure à la date de fin.',
  INTERNAL_ERROR: 'Erreur interne du serveur.',
  UNKNOWN_ERROR: 'Erreur inconnue. Veuillez contacter l’administrateur.',

  // ==============================
  // Users (Client)
  // ==============================
  USER_NOT_FOUND: 'Utilisateur introuvable.',
  INVALID_ROLE: 'Rôle invalide ou non autorisé.',
  USER_INACTIVE: 'Cet utilisateur est suspendu.',
  USER_ALREADY_ACTIVE: 'Cet utilisateur est déjà activé.',

  // Users / Backoffice / Roles
  CANNOT_UPDATE_OWN_ROLE: 'Vous ne pouvez pas modifier votre propre rôle.',
  CANNOT_DELETE_SELF: 'Vous ne pouvez pas vous supprimer de ce client.',
  INVALID_STATUS_TRANSITION: 'Transition de statut invalide.',
 
  // Activation / Password reset
  ACTIVATION_TOKEN_REQUIRED: "Le jeton d'activation est requis.",
  ACTIVATION_TOKEN_INVALID: "Le jeton d'activation est invalide.",
  ACTIVATION_TOKEN_EXPIRED:
    "Le jeton d'activation a expiré. Un nouveau lien d'activation a été envoyé.",
  ACTIVATION_TOKEN_SECRET_MISSING:
    "Le secret du jeton d'activation n'est pas configuré.",
  ADDRESS_FIELDS_REQUIRED: "Les champs d'adresse sont requis.",
 
  // Password reset
  PASSWORD_RESET_TOKEN_REQUIRED:
    'Le jeton de réinitialisation du mot de passe est requis.',
  PASSWORD_RESET_TOKEN_INVALID:
    'Le jeton de réinitialisation du mot de passe est invalide.',
  PASSWORD_RESET_TOKEN_EXPIRED:
    'Le jeton de réinitialisation du mot de passe a expiré.',
  PASSWORD_RESET_TOKEN_SECRET_MISSING:
    "Le secret du jeton de réinitialisation du mot de passe n'est pas configuré.",

  // Profile / Password change
  USER_SHOULD_BE_ACTIVE:
    'Votre compte a été désactivé. Contactez votre administrateur.',
  OLD_PASSWORD_MISMATCH: "L'ancien mot de passe ne correspond pas.",
  INVALID_PASSWORD_FORMAT:
    'Le mot de passe ne respecte pas les règles de sécurité.',
  PASSWORD_MUST_BE_DIFFERENT_FROM_OLD:
    "Le nouveau mot de passe doit être différent de l'ancien.",

} as const;

export type ApiErrorCode = keyof typeof API_ERROR;

/**
 * Codes d'erreur renvoyes par l'API dans `messages.code`.
 * `satisfies` garantit qu'un code inexistant dans API_ERROR ne compile pas :
 * une faute de frappe ici rendrait une branche de traitement inatteignable.
 */
export const API_ERROR_CODE = {
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  ACCOUNT_NOT_ACTIVE: 'AUTH_ACCOUNT_NOT_ACTIVE',
  REFRESH_TOKEN_INVALID_OR_EXPIRED: 'REFRESH_TOKEN_INVALID_OR_EXPIRED',
  REFRESH_TOKEN_INVALID_OR_USED: 'REFRESH_TOKEN_INVALID_OR_USED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
} as const satisfies Record<string, ApiErrorCode>;
