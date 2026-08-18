// src/features/user/constants/delete-user.constants.ts

export const USER_DELETE_CARD = {
  TITLE: 'Suppression',
  DESCRIPTION: 'Supprimer définitivement cet utilisateur',
} as const;
export const DELETE_USER_SHEET = {
  TITLE: "Supprimer l'utilisateur",
  EXPECTED_ACTION:
    'Action exceptionnelle — assurez-vous d’avoir sauvegardé ce qui est nécessaire.',
  INTRO: "Vous êtes sur le point de supprimer définitivement cet utilisateur.",

  WARNING: {
    TITLE: 'Suppression définitive',
    INTRO:
      'Cette action entraînera la suppression définitive des données associées à cet utilisateur :',
    BULLETS: [
      'Les accès à ce client',
      'Les rôles/permissions liés sur ce client',
      "L'utilisateur peut être supprimé entièrement s’il n’a qu’un seul rattachement.",
    ],
  },
} as const;

export const TOASTS = {
  USER_DELETED: 'Utilisateur supprimé avec succès',
} as const;

export const ERRORS = {
  DELETE_USER: 'Erreur suppression utilisateur',
} as const;

