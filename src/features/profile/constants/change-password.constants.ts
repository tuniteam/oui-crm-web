export const CHANGE_PASSWORD_WINDOW = {
  TITLE: 'Changer le mot de passe',

  LABELS: {
    OLD_PASSWORD: 'Mot de passe actuel',
    NEW_PASSWORD: 'Nouveau mot de passe',
    CONFIRM_NEW_PASSWORD: 'Confirmer le nouveau mot de passe',
    SECURITY_RULES: 'Règles de sécurité',
    DIFFERENT_FROM_OLD: 'Différent du mot de passe actuel',
    PASSWORDS_MATCH: 'Les deux nouveaux mots de passe sont identiques',
  },

  PLACEHOLDERS: {
    OLD_PASSWORD: 'Votre mot de passe actuel',
    NEW_PASSWORD: 'Votre nouveau mot de passe',
    CONFIRM_NEW_PASSWORD: 'Confirmez votre nouveau mot de passe',
  },

  BUTTONS: {
    CANCEL: 'Annuler',
    CONFIRM: 'Confirmer',
  },

  LOADING_LABELS: {
    CONFIRMING: 'Confirmation...',
  },

  TOASTS: {
    SUCCESS: 'Mot de passe modifié avec succès',
    ERROR: 'Impossible de modifier le mot de passe',
  },

  ERRORS: {
    OLD_PASSWORD_REQUIRED: 'Mot de passe actuel requis',
    NEW_PASSWORD_REQUIRED: 'Nouveau mot de passe requis',
    CONFIRM_PASSWORD_REQUIRED: 'Confirmation requise',

    PASSWORD_MIN: 'Minimum 8 caractères',
    PASSWORD_MAX: 'Maximum 100 caractères',

    PASSWORD_COMPLEXITY:
      'Le mot de passe doit contenir majuscule, minuscule, chiffre et caractère spécial',

    PASSWORD_DIFFERENT:
      'Le nouveau mot de passe doit être différent du mot de passe actuel',

    PASSWORD_MATCH:
      'Les mots de passe ne correspondent pas',
  },
} as const;