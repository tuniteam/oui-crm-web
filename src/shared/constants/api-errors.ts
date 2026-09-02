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

  // Garde de projet (en-tete x-project-id)
  PROJECT_IS_REQUIRED: 'Aucun projet sélectionné.',
  PROJECT_MISMATCH: "Vous n'avez pas accès à ce projet.",
  PROJECT_NOT_ACTIVE: 'Projet indisponible.',
  USER_HAS_NO_PROJECT: "Aucun projet ne vous est affecté.",

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
  TEMPLATE_INVALID: 'Le gabarit ne respecte pas le format attendu.',
  STORAGE_FILE_REQUIRED: 'Aucun fichier sélectionné.',
  STORAGE_FILE_TOO_LARGE: 'Le fichier dépasse la taille maximale autorisée.',
  STORAGE_INVALID_MIME_TYPE: "Le type de fichier n'est pas accepté.",
  STORAGE_INVALID_MAGIC_BYTES: "Ce fichier n'est pas une image valide.",
  SETTINGS_NOT_FOUND: 'Réglages introuvables pour ce projet.',
  PASSWORD_TOO_WEAK:
    'Le mot de passe doit contenir au moins 10 caractères, une lettre et un chiffre.',
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

  // ==============================
  // Lot L1 — Base commerciale
  // ==============================
  ORGANIZATION_NOT_FOUND: 'Organisme introuvable.',
  ORGANIZATION_SIRET_EXISTS:
    'Ce SIRET est déjà utilisé par un organisme du projet.',
  ORGANIZATION_INSEE_CODE_EXISTS:
    'Ce code INSEE est déjà utilisé par un organisme du projet.',
  ORGANIZATION_POSSIBLE_DUPLICATE:
    'Un organisme portant ce nom existe déjà à ce code postal.',
  ORGANIZATION_HAS_CONTRACTS:
    'Cet organisme porte un contrat : il ne peut pas être supprimé.',
  INVALID_REFERENCE_VALUE:
    "Cette valeur n'existe pas dans les référentiels du projet.",
  CONTACT_NOT_FOUND: 'Contact introuvable.',
  CONTACT_PRIMARY_CONFLICT: 'Un autre contact est déjà le contact principal.',
  CONTACT_HAS_ACTIVITIES:
    "Ce contact est référencé par une action : l'historique garde ses acteurs.",

  /*
   * Registre officiel : ce ne sont PAS des erreurs a afficher en rouge. Le
   * contrat les designe comme le signal de basculer en saisie manuelle — cas
   * nominal. Les libelles restent neutres pour cette raison.
   */
  REGISTRY_UNAVAILABLE:
    'Le registre officiel est momentanément indisponible. Vous pouvez saisir la fiche manuellement.',
  REGISTRY_TIMEOUT:
    "Le registre officiel n'a pas répondu. Vous pouvez saisir la fiche manuellement.",

  // Users du projet (US-00-05)
  INITIALS_ALREADY_USED:
    'Ces initiales sont déjà utilisées dans ce projet.',
  EMAIL_EXISTS_FOR_PROJECT:
    'Cet utilisateur est déjà rattaché à ce projet.',
  EMAIL_ALREADY_TAKEN:
    "Cette adresse appartient à un compte back-office. Les deux types de comptes sont distincts.",
  EXPIRATION_REQUIRED_FOR_EXTERNAL:
    "Un accès externe demande une date de fin d'accès.",
  SCOPE_NOT_FOUND: 'Périmètre introuvable.',
  USER_IS_LAST_ADMIN:
    "Impossible : c'est le dernier administrateur actif du projet.",
  EMPTY_UPDATE_PAYLOAD: 'Aucune modification à enregistrer.',
  PERMISSION_NOT_FOUND: 'Permission inconnue.',
  CANNOT_UPDATE_OWN_ACCESS:
    "Vous ne pouvez pas modifier votre propre périmètre ni votre date de fin d'accès.",

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
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  ACCOUNT_NOT_ACTIVE: 'AUTH_ACCOUNT_NOT_ACTIVE',
  REFRESH_TOKEN_INVALID_OR_EXPIRED: 'REFRESH_TOKEN_INVALID_OR_EXPIRED',
  REFRESH_TOKEN_INVALID_OR_USED: 'REFRESH_TOKEN_INVALID_OR_USED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  TEMPLATE_INVALID: 'TEMPLATE_INVALID',
  PROJECT_IS_REQUIRED: 'PROJECT_IS_REQUIRED',
  PROJECT_MISMATCH: 'PROJECT_MISMATCH',
  PROJECT_NOT_ACTIVE: 'PROJECT_NOT_ACTIVE',
  USER_HAS_NO_PROJECT: 'USER_HAS_NO_PROJECT',
  INITIALS_ALREADY_USED: 'INITIALS_ALREADY_USED',
  EMAIL_EXISTS_FOR_PROJECT: 'EMAIL_EXISTS_FOR_PROJECT',
  EMAIL_ALREADY_TAKEN: 'EMAIL_ALREADY_TAKEN',
  EXPIRATION_REQUIRED_FOR_EXTERNAL: 'EXPIRATION_REQUIRED_FOR_EXTERNAL',
  SCOPE_NOT_FOUND: 'SCOPE_NOT_FOUND',
  USER_IS_LAST_ADMIN: 'USER_IS_LAST_ADMIN',
  EMPTY_UPDATE_PAYLOAD: 'EMPTY_UPDATE_PAYLOAD',
  PERMISSION_NOT_FOUND: 'PERMISSION_NOT_FOUND',
  CANNOT_UPDATE_OWN_ACCESS: 'CANNOT_UPDATE_OWN_ACCESS',
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
  ORGANIZATION_SIRET_EXISTS: 'ORGANIZATION_SIRET_EXISTS',
  ORGANIZATION_INSEE_CODE_EXISTS: 'ORGANIZATION_INSEE_CODE_EXISTS',
  ORGANIZATION_POSSIBLE_DUPLICATE: 'ORGANIZATION_POSSIBLE_DUPLICATE',
  ORGANIZATION_HAS_CONTRACTS: 'ORGANIZATION_HAS_CONTRACTS',
  INVALID_REFERENCE_VALUE: 'INVALID_REFERENCE_VALUE',
  CONTACT_NOT_FOUND: 'CONTACT_NOT_FOUND',
  CONTACT_PRIMARY_CONFLICT: 'CONTACT_PRIMARY_CONFLICT',
  CONTACT_HAS_ACTIVITIES: 'CONTACT_HAS_ACTIVITIES',
  REGISTRY_UNAVAILABLE: 'REGISTRY_UNAVAILABLE',
  REGISTRY_TIMEOUT: 'REGISTRY_TIMEOUT',
} as const satisfies Record<string, ApiErrorCode>;
