/**
 * Supprimer définitivement un compte — US-00-05 §7.
 *
 * À ne pas confondre avec le retrait du projet, qui vit dans
 * `delete-user.constants.ts` : celui-là suspend et se défait, celui-ci retire
 * le rattachement et emporte le compte quand c'était le dernier — sessions,
 * jetons d'activation et photo de profil compris.
 *
 * Ce geste n'existe que pour un compte **créé par erreur**. Dès que quelque
 * chose porte le nom de la personne dans le projet, le serveur refuse par
 * `409 USER_HAS_REFERENCES` et l'écran renvoie vers le retrait.
 */
export const DELETE_ACCOUNT_UI = {
  CARD: {
    TITLE: 'Supprimer définitivement le compte',
    DESCRIPTION:
      "Pour un compte créé par erreur. Le retrait du projet est le geste courant : il se défait, celui-ci non.",
    ACTION: 'Supprimer définitivement',
  },

  WINDOW: {
    TITLE: (name: string) => `Supprimer définitivement « ${name} » ?`,
    LEAD: 'Cette action ne se défait pas.',
    BULLETS: [
      'Le rattachement à ce projet est retiré',
      "Le compte est supprimé si c'était son dernier rattachement",
      'Ses sessions, son lien d’activation et sa photo partent avec lui',
      'Rattaché à un autre projet, il garde son compte et ne perd que cet accès',
    ],
    CONFIRM: 'Supprimer définitivement',
    CANCEL: 'Annuler',
    DONE: 'Compte supprimé',
  },

  /**
   * Le refus, avec ce qui le motive.
   *
   * On nomme les compteurs plutôt que de dire « des données » : « 4 organismes
   * et 2 devis » se vérifie, « des données » se subit. Et on propose le
   * retrait dans la foulée — sans quoi c'est une impasse.
   */
  REFUSED: {
    TITLE: 'Ce compte ne peut pas être supprimé',
    SENTENCE: (what: string) => `${what} lui sont rattachés dans ce projet.`,
    FALLBACK: 'Vous pouvez le retirer du projet à la place : son accès est suspendu, ses données restent.',
    REMOVE: 'Retirer du projet',
  },

  ERRORS: {
    DELETE: 'Impossible de supprimer ce compte.',
  },
} as const;

/**
 * Ce que comptent les huit clés de `meta`, en français.
 *
 * L'API ne renvoie **que les clés non nulles** : la table couvre les huit,
 * l'écran n'en affiche que ce qui arrive. Singulier et pluriel séparés — « 1
 * devis » et « 2 devis » ne se conjuguent pas comme « 1 organisme » et
 * « 2 organismes ».
 */
export const USER_REFERENCE_LABELS: Record<string, readonly [string, string]> = {
  organizations: ['organisme', 'organismes'],
  opportunities: ['opportunité', 'opportunités'],
  quotes: ['devis', 'devis'],
  contracts: ['contrat', 'contrats'],
  campaigns: ['campagne', 'campagnes'],
  activities: ['action commerciale', 'actions commerciales'],
  files: ['fichier', 'fichiers'],
  pricingGrids: ['grille tarifaire', 'grilles tarifaires'],
};
