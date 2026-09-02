// src/features/user/constants/delete-user.constants.ts

/**
 * Retrait d'un utilisateur du projet.
 *
 * L'API ne supprime rien : DELETE /users/:id passe l'affectation en
 * SUSPENDED, et un nouveau POST /users la reactive avec les valeurs
 * soumises. Les sessions ne sont revoquees que si le compte n'a plus aucune
 * autre affectation active. Le compte, lui, survit — il peut appartenir a
 * d'autres projets.
 *
 * Les libelles disaient l'inverse (« suppression definitive des donnees
 * associees »). Un administrateur pouvait renoncer a une action anodine, ou
 * croire avoir efface des donnees personnelles qui sont toujours la.
 */
export const USER_DELETE_CARD = {
  TITLE: 'Retrait du projet',
  DESCRIPTION: 'Retirer cet utilisateur du projet',
} as const;

export const DELETE_USER_WINDOW = {
  TITLE: "Retirer l'utilisateur du projet",
  EXPECTED_ACTION:
    "Son accès est suspendu, pas supprimé : vous pourrez le rétablir en l'ajoutant à nouveau.",
  INTRO: "Vous êtes sur le point de retirer cet utilisateur du projet.",

  WARNING: {
    TITLE: 'Ce que fait ce retrait',
    INTRO: 'Sur ce projet uniquement :',
    BULLETS: [
      'Son accès au projet est suspendu',
      'Son rôle et ses permissions sur ce projet cessent de s’appliquer',
      "Ses sessions ne prennent fin que s'il n'a aucun autre projet",
      'Son compte et ses autres projets ne sont pas touchés',
    ],
  },

  /* Libelle propre plutot que le « Supprimer » partage : le bouton ne
     supprime pas, et la constante commune sert ailleurs. */
  ACTIONS: {
    CONFIRM: 'Retirer du projet',
  },
} as const;

export const TOASTS = {
  USER_DELETED: 'Utilisateur retiré du projet',
} as const;

export const ERRORS = {
  DELETE_USER: 'Erreur lors du retrait',
} as const;
