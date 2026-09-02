/**
 * Fiche d'un organisme — panneau lateral, onglet Synthese (US-01-03).
 *
 * Decoupage et intitules repris de `paneHTML('synthese')` de la maquette V8 :
 * Identite, Environnement periscolaire, Suivi.
 */
export const ORGANIZATION_DETAIL_UI = {
  TABS: {
    SUMMARY: 'Synthèse',
    CONTACTS: 'Contacts',
  },

  SECTIONS: {
    IDENTITY: 'Identité',
    ENVIRONMENT: 'Environnement périscolaire',
    FOLLOW_UP: 'Suivi',
  },

  LABELS: {
    NAME: 'Nom',
    TYPE: 'Type de structure',
    SIRET: 'SIRET',
    INSEE: 'Code INSEE',
    ADDRESS: 'Adresse',
    POSTAL_CODE: 'Code postal',
    CITY: 'Ville',
    DEPARTMENT: 'Département',
    REGION: 'Région',
    POPULATION: 'Population',
    BRACKET: 'Strate',
    EPCI: 'EPCI',
    PHONE: 'Téléphone',
    EMAIL: 'Email',
    WEBSITE: 'Site internet',

    SOLUTION: 'Solution en place',
    SCHOOL_COUNT: 'Nombre d’écoles',
    CHILD_COUNT: 'Enfants concernés (estimation)',
    SERVICES: 'Services gérés',

    SALES_STATUS: 'Statut commercial',
    CUSTOMER_STATUS: 'Statut client',
    PRIORITY: 'Priorité',
    SALES_REP: 'Commercial en charge',
    TAGS: 'Étiquettes',
    NOTES: 'Notes internes',
  },

  HINTS: {
    /* La strate vient de la grille tarifaire active du projet : la V8 la rend
       aussi en champ desactive. */
    BRACKET: 'Calculée depuis la grille tarifaire du projet.',
    REGION: 'Déduite du département.',
    /* Le serveur refuse ces deux champs en modification. Les afficher en
       lecture seule vaut mieux que d'offrir un sélecteur qui ferait échouer
       tout l'enregistrement, pas seulement le champ. */
    SALES_STATUS_READ_ONLY:
      'Se modifie depuis le tableau de prospection, pas ici.',
    CUSTOMER_STATUS_READ_ONLY:
      'Suit le déploiement et les contrats, pas la fiche.',
  },

  COMPLETENESS: {
    COMPLETE: 'Fiche complète : contrat générable sans blocage.',
    INCOMPLETE: (missing: string) =>
      `Fiche incomplète — ${missing} manque. Ces éléments sont exigés pour générer un contrat.`,
    INCOMPLETE_PLURAL: (missing: string) =>
      `Fiche incomplète — ${missing} manquent. Ces éléments sont exigés pour générer un contrat.`,
    QUOTE_BLOCKED:
      'Sans population, aucune strate tarifaire : le devis est bloqué.',
  },

  /** Intitules des criteres de completude, tels que la V8 les nomme. */
  MISSING_LABELS: {
    SIRET: 'le SIRET',
    ADDRESS: 'l’adresse',
    POSTAL_CODE: 'le code postal',
    POPULATION: 'la population',
    PRIMARY_CONTACT: 'le contact principal',
    EMAIL: 'l’email',
  } as Record<string, string>,

  RESTRICTED: {
    TITLE: 'Lecture restreinte',
    BODY:
      'Cet organisme est hors de votre périmètre. Vous voyez qu’il est suivi, par qui et à quel stade, sans accéder à ses coordonnées ni à ses contacts. Cette visibilité évite que deux commerciaux appellent la même mairie à trois jours d’intervalle.',
  },

  ACTIONS: {
    SAVE: 'Enregistrer les modifications',
    CLOSE: 'Fermer',
  },

  TOASTS: {
    SAVED: 'Organisme enregistré',
    SAVE_ERROR: 'Erreur lors de l’enregistrement',
    NO_CHANGE: 'Aucune modification à enregistrer',
  },

  UNASSIGNED: 'Non affecté',
  EMPTY_VALUE: '—',
} as const;
