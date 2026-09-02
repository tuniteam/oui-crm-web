/** Contacts d'un organisme — US-01-04. Libellés de l'onglet Contacts de la V8. */

export const CONTACT_ROUTES = {
  /** Route scopée projet, comme tout le reste du lot. */
  CONTACT_API: (contactId: string) => `/contacts/${contactId}`,
} as const;

export const CONTACTS_UI = {
  INTRO:
    'Élus, direction générale et référents opérationnels. Le contact principal est le signataire du contrat.',
  ADD: 'Ajouter un contact',

  BADGES: {
    PRIMARY: 'Contact principal',
    OPT_OUT: 'Ne pas démarcher',
    /** Contact deviné à l'import : il n'a pas été confirmé par un humain. */
    EXTRACTED: 'Extrait d’une note',
  },

  FALLBACKS: {
    ROLE: 'Fonction non renseignée',
    EMAIL: 'email inconnu',
    PHONE: 'téléphone inconnu',
  },

  EMPTY: {
    TITLE: 'Aucun contact',
    DESCRIPTION:
      'Ajoutez au moins le représentant légal : il est requis pour générer un contrat.',
  },

  ACTIONS: {
    EDIT: 'Modifier',
    DELETE: 'Supprimer',
  },

  /** Accès refusé sur une fiche hors périmètre — les contacts sont des détails. */
  FORBIDDEN:
    'Les coordonnées des contacts ne sont visibles que sur les fiches de votre périmètre.',
} as const;

export const CONTACT_WINDOW = {
  CREATE_TITLE: 'Nouveau contact',
  EDIT_TITLE: 'Modifier le contact',

  FIELDS: {
    CIVILITY: 'Civilité',
    FIRST_NAME: 'Prénom',
    LAST_NAME: 'Nom',
    ROLE: 'Fonction',
    EMAIL: 'Email',
    PHONE: 'Téléphone',
    MOBILE: 'Mobile',
    NOTES: 'Notes',
    IS_PRIMARY: 'Contact principal',
    OPT_OUT: 'Ne pas démarcher',
  },

  HINTS: {
    /** Le serveur rétrograde l'ancien principal dans la même transaction. */
    IS_PRIMARY:
      'Un seul contact principal par organisme : le précédent sera rétrogradé.',
    OPT_OUT: 'Ce contact sera exclu des campagnes.',
    EMAIL: 'Requis seulement pour être ciblé par une campagne e-mail.',
  },

  ACTIONS: {
    SAVE: 'Enregistrer',
    CREATE: 'Créer le contact',
    CANCEL: 'Annuler',
  },
} as const;

export const DELETE_CONTACT_WINDOW = {
  TITLE: 'Supprimer ce contact',
  INTRO: 'Vous êtes sur le point de supprimer ce contact.',
  BULLETS: [
    'Il disparaît de la fiche et des campagnes à venir',
    'La complétude de l’organisme est recalculée',
    'L’opération est inscrite au journal d’activité',
  ],

  /**
   * `409 CONTACT_HAS_ACTIVITIES` : l'historique garde ses acteurs, la
   * suppression est donc refusée. Le contrat indique la sortie — proposer
   * « ne pas démarcher » plutôt qu'un message d'échec sans suite.
   */
  BLOCKED: {
    TITLE: 'Ce contact est référencé par des actions',
    DESCRIPTION:
      'Il ne peut pas être supprimé : l’historique garde ses acteurs. Vous pouvez le marquer « Ne pas démarcher » pour l’exclure des campagnes.',
    ACTION: 'Marquer « Ne pas démarcher »',
  },

  ACTIONS: {
    CONFIRM: 'Supprimer le contact',
    CANCEL: 'Annuler',
  },
} as const;

export const CONTACT_ERROR_MESSAGES = {
  /** La fiche a disparu depuis l'ouverture du panneau. On le dit sans fermer :
   *  l'utilisateur garde sa saisie sous les yeux et décide lui-même. */
  ORGANIZATION_NOT_FOUND:
    'Cette fiche n’existe plus : elle a été supprimée ou rechargée. Rouvrez-la depuis la liste.',
  /** Le contact a été supprimé ailleurs : la liste se recharge d'elle-même. */
  CONTACT_NOT_FOUND:
    'Ce contact n’existe plus. La liste vient d’être rafraîchie.',
} as const;

export const CONTACT_TOASTS = {
  CREATED: 'Contact ajouté',
  UPDATED: 'Contact modifié',
  DELETED: 'Contact supprimé',
  OPTED_OUT: 'Contact exclu des campagnes',
} as const;

/** Codes d'erreur routés par l'écran. */
export const CONTACT_ERRORS = {
  HAS_ACTIVITIES: 'CONTACT_HAS_ACTIVITIES',
  ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
  NOT_FOUND: 'CONTACT_NOT_FOUND',
  PRIMARY_CONFLICT: 'CONTACT_PRIMARY_CONFLICT',
} as const;
