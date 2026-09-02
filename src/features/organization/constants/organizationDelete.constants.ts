/**
 * Suppression d'un organisme — US-01-13.
 *
 * Les libelles disent ce que fait reellement l'API, pas ce que montre la V8.
 * La maquette n'offre qu'une suppression groupee (US-01-05, non livree cote
 * API) et annonce que « les contacts et actions rattaches » partent avec la
 * fiche. Ici la suppression est **logique** : la ligne reste en base avec sa
 * date, disparait de toutes les lectures, et la purge definitive releve du
 * RGPD (US-06-01). Reprendre la formulation de la maquette ferait croire a un
 * effacement definitif qui n'a pas lieu.
 */
export const ORGANIZATION_DELETE_CARD = {
  TITLE: 'Supprimer la fiche',
  DESCRIPTION: 'Retirer cet organisme de la base de prospection',
} as const;

export const DELETE_ORGANIZATION_WINDOW = {
  TITLE: 'Supprimer cet organisme',
  INTRO: 'Vous êtes sur le point de supprimer cette fiche.',

  WARNING: {
    TITLE: 'Ce que fait cette suppression',
    BULLETS: [
      'La fiche disparaît des listes, des recherches et des filtres',
      'Son SIRET et son code INSEE redeviennent disponibles : la fiche peut être recréée',
      'Les données ne sont pas effacées définitivement — cela relève de la purge RGPD',
      'L’opération est inscrite au journal d’activité',
    ],
  },

  ACTIONS: {
    CONFIRM: 'Supprimer la fiche',
    CANCEL: 'Annuler',
  },
} as const;

export const DELETE_ORGANIZATION_TOASTS = {
  DELETED: 'Organisme supprimé',
  ERROR: 'Erreur lors de la suppression',
} as const;
