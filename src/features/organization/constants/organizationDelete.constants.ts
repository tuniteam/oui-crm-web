/**
 * Suppression d'un organisme — US-01-13.
 *
 * **La suppression est définitive depuis le 06/09/2026.** Elle l'était
 * logique jusque-là — la ligne restait en base avec sa date, et la purge
 * relevait du RGPD. Ce n'est plus vrai : la fiche part, ses contacts partent,
 * et ses rendez-vous partent avec, passés comme futurs. Les libellés ci-dessous
 * ont été réécrits pour le dire ; l'ancien texte promettait une réversibilité
 * qui n'existe plus.
 */
export const ORGANIZATION_DELETE_CARD = {
  TITLE: 'Supprimer la fiche',
  DESCRIPTION: 'Retirer définitivement cet organisme de la base',
} as const;

export const DELETE_ORGANIZATION_WINDOW = {
  TITLE: 'Supprimer cet organisme',
  INTRO: 'Vous êtes sur le point de supprimer cette fiche définitivement.',

  WARNING: {
    TITLE: 'Ce que cette suppression emporte',
    BULLETS: [
      'La fiche est effacée : l’opération est sans retour',
      'Son SIRET et son code INSEE redeviennent disponibles',
      'L’opération est inscrite au journal d’activité',
    ],
  },

  /**
   * Ce que la fiche emporte, en chiffres.
   *
   * Les nombres viennent de `counts` sur le détail déjà chargé : aucun appel
   * de plus. Un rendez-vous passé est un historique commercial, et c'est
   * précisément ce qu'on ne pense pas à perdre — les deux nombres sont donc
   * annoncés avant le clic, pas constatés après.
   */
  CARRIES: (contacts: number, activities: number) => {
    const parts = [];
    if (contacts > 0) {
      parts.push(`${contacts} contact${contacts > 1 ? 's' : ''}`);
    }
    if (activities > 0) {
      parts.push(`${activities} rendez-vous`);
    }
    if (parts.length === 0) return null;

    /*
     * La mise en garde est une phrase a part : accolee a l'enumeration, elle
     * ne s'accordait pas — « 1 rendez-vous (passes comme a venir) ». Et c'est
     * l'historique qu'on ne pense pas a perdre, il merite sa phrase.
     */
    const carried = `Partiront avec elle : ${parts.join(' et ')}.`;
    return activities > 0
      ? `${carried} L’historique des rendez-vous passés est effacé.`
      : carried;
  },

  ACTIONS: {
    CONFIRM: 'Supprimer définitivement',
    CANCEL: 'Annuler',
  },
} as const;

/**
 * Les engagements qui retiennent une fiche — `409 ORGANIZATION_HAS_ENGAGEMENTS`.
 *
 * Le serveur nomme dans `messages.meta` ce qui bloque, avec un compte par
 * nature. Un message générique laisserait l'utilisateur chercher lui-même ; on
 * dit **quoi** retire la fiche, et par où sortir.
 */
export const ORGANIZATION_ENGAGEMENTS = {
  quotes: (n: number) => `${n} devis`,
  opportunities: (n: number) => `${n} opportunité${n > 1 ? 's' : ''}`,
  files: (n: number) => `${n} document${n > 1 ? 's' : ''}`,
  /** Un contrat n'a pas de sortie : la fiche devient non supprimable. */
  contracts: (n: number) => `${n} contrat${n > 1 ? 's' : ''}`,
} as const;

export const DELETE_ORGANIZATION_TOASTS = {
  DELETED: 'Organisme supprimé',
  ERROR: 'Erreur lors de la suppression',

  /** Ce qui retient la fiche, nommé et chiffré. */
  HAS_ENGAGEMENTS: (what: string) =>
    `Cette fiche ne peut pas être supprimée : elle porte ${what}.`,
  /**
   * Un contrat est sans issue, le reste se retire. Le dire évite qu'on
   * cherche une sortie qui n'existe pas.
   */
  HAS_CONTRACTS:
    'Une fiche portant un contrat ne peut pas être supprimée.',
  REMOVE_FIRST: 'Retirez-les avant de supprimer la fiche.',
} as const;
