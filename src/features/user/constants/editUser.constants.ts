// src/features/users/constants/editUser.constants.ts

export const UPDATE_USER_WINDOW = {
  TITLE: 'Modifier un utilisateur',
  LABELS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    /* Le statut n'est plus modifiable ici : l'API refuse `status` sur
       PATCH /users/:id. Il se pilote par la suspension et la re-creation. */
    ROLE: 'Rôle',
    INITIALS: 'Initiales',
    EXTERNAL: 'Accès externe',
    EXPIRES_AT: "Fin d'accès",
    SCOPE: 'Périmètre',
  },
  PLACEHOLDERS: {
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    ROLE: 'Sélectionner un rôle',
    INITIALS: 'WB',
    /* Pas de périmètre = accès à toute la base : c'est ce que le vide veut
       dire, et il faut le dire. */
    SCOPE: 'Toute la base',
  },
  HINTS: {
    SCOPE:
      'Ce que cet utilisateur voit dans la base d’organismes. Sans périmètre, il voit tout.',
    OWN_ACCOUNT:
      "Sur votre propre compte, le rôle et l'accès ne sont pas modifiables.",
  },
  LOADING_LABELS: {
    SAVING: 'Enregistrement...',
  },
  ACTIONS: {
    CANCEL: 'Annuler',
    SAVE: 'Enregistrer',
  },
} as const;
