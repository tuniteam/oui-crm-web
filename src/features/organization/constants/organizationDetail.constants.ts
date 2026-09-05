/**
 * Fiche d'un organisme — panneau lateral, onglet Synthese (US-01-03).
 *
 * Decoupage et intitules repris de `paneHTML('synthese')` de la maquette V8 :
 * Identite, Environnement periscolaire, Suivi.
 */
export const ORGANIZATION_DETAIL_UI = {
  /** Fiche disparue depuis l'ouverture, ou identifiant périmé dans l'URL. */
  NOT_FOUND: 'Fiche introuvable',

  TABS: {
    SUMMARY: 'Synthèse',
    CONTACTS: 'Contacts',
  },

  SECTIONS: {
    IDENTITY: 'Identité',
    ENVIRONMENT: 'Environnement périscolaire',
    FOLLOW_UP: 'Suivi',
  },

  /**
   * Horaires d'ouverture — L1 · US-01-15.
   *
   * Les clés du contrat sont en MAJUSCULES_UNDERSCORE : les afficher telles
   * quelles montrerait « MONDAY » à un commercial. On traduit ici, une fois.
   */
  OPENING_HOURS: {
    /*
     * « Horaires d'ouverture », et non « de la mairie ».
     *
     * Le referentiel porte seize types de structure, dont deux seulement sont
     * des mairies : un EPCI, un CCAS, une creche privee ou une association
     * gestionnaire porteraient un titre faux. Le type exact est deja affiche
     * en tete de fiche — le repeter ici n'apprendrait rien.
     */
    TITLE: 'Horaires d’ouverture',
    /** Un jour absent du contrat est un jour de fermeture, pas une donnée
     *  manquante — c'est la règle qui demande de rendre la semaine entière. */
    CLOSED: 'Fermé',
    DAYS: {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche',
    } as Record<string, string>,
    /** « 08:30-12:00 » se lit « 08:30 – 12:00 » ; deux créneaux se séparent
     *  d'une virgule, la coupure méridienne se voyant d'elle-même. */
    SLOT: (slot: string) => slot.replace('-', ' – '),

    EDIT: 'Modifier',
    /** Etat vide : rien n'a ete declare, ou l'import n'a rien trouve. */
    NONE: 'Aucun horaire renseigné.',
    EDIT_TITLE: 'Horaires d’ouverture',
    EDIT_LEAD:
      'Indiquez les jours d’ouverture et leurs créneaux. Rien n’est enregistré tant que vous n’avez pas validé la fiche.',
    ADD_SLOT: 'Ajouter un créneau',
    REMOVE_SLOT: 'Retirer ce créneau',
    APPLY_TO_ALL: 'Appliquer ces horaires à tous les jours ouverts',
    /** Les mairies ouvrent au quart d'heure ; la minute n'apporte rien. */
    STEP_MINUTES: 15,

    COMMENT: 'Précision',
    COMMENT_PLACEHOLDER:
      'Permanence, agence postale, fermeture saisonnière…',
    /** Borne du contrat : au-delà, `400 INVALID_DATA`. */
    COMMENT_MAX: 500,

    /**
     * Fermer tous les jours **efface** les horaires.
     *
     * Le contrat efface sur `null` ; `days: []` est accepté et stocké tel
     * quel, ce qui donnerait une fiche vide sans l'être. On envoie donc `null`
     * — et on prévient, l'effacement ne se distinguant pas à l'écran d'une
     * semaine sans horaires.
     */
    WILL_CLEAR:
      'Aucun jour n’est ouvert : les horaires seront effacés de la fiche.',

    CONFIRM: 'Valider',
    CANCEL: 'Annuler',

    /**
     * Ce que l'API laisse passer, et que l'editeur refuse.
     *
     * Verifie en direct : le serveur accepte `17:00-09:00` et deux creneaux
     * qui se chevauchent. Aucune des deux valeurs n'est rattrapable a
     * l'affichage, elles s'arretent donc a la saisie.
     */
    ERRORS: {
      INCOMPLETE: 'Indiquez une heure de début et une heure de fin.',
      BACKWARDS: 'La fin doit suivre le début.',
      OVERLAP: 'Le second créneau commence avant la fin du premier.',
    },
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
    VENDOR: (vendor: string) => `Éditeur : ${vendor}`,
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

  /** Pied de la V8 : « Créée le … · modifiée le … ». */
  TIMESTAMPS: (created: string, updated: string) =>
    `Créée le ${created} · modifiée le ${updated}`,

  ACTIONS: {
    /**
     * Le site d'une commune n'est renseigne que six fois sur dix : le lien
     * n'existe que quand l'adresse existe, et son absence n'est pas une
     * anomalie a signaler.
     */
    OPEN_WEBSITE: 'Ouvrir le site dans un nouvel onglet',
    SAVE: 'Enregistrer les modifications',
    CANCEL: 'Annuler',
    CLOSE: 'Fermer',
  },

  TOASTS: {
    SAVED: 'Organisme enregistré',
    SAVE_ERROR: 'Erreur lors de l’enregistrement',
    NO_CHANGE: 'Aucune modification à enregistrer',
  },

  /**
   * Compléter une fiche depuis le registre officiel.
   *
   * Le parcours ne ressemble qu'à moitié à celui de la création : là-bas la
   * saisie est vide et tout se pose sans risque ; ici la fiche existe, et
   * poser une valeur peut en effacer une juste. D'où le pas supplémentaire —
   * on montre ce qu'on remplacerait, et l'utilisateur décide champ par champ.
   */
  REGISTRY_FILL: {
    OPEN: 'Compléter depuis le registre',
    TITLE: 'Compléter depuis le registre officiel',

    /** Dit d'emblée que rien ne part : le bouton d'enregistrement reste maître. */
    LEAD:
      'Choisissez l’établissement, puis les champs à reprendre. Rien n’est enregistré : les valeurs sont posées dans la fiche, et vous les validez avec « Enregistrer les modifications ».',

    USE: 'Reprendre cette fiche',
    BACK: 'Choisir un autre établissement',
    CANCEL: 'Annuler',
    CONFIRM: 'Remplir la fiche',

    /** Les deux natures de ligne, et c'est toute la règle de l'écran. */
    EMPTY_FIELDS: 'Champs vides — cochés d’office',
    FILLED_FIELDS: 'Champs déjà renseignés — décochés, cochez pour remplacer',
    CURRENT: 'Actuel',
    FOUND: 'Au registre',

    /** Une valeur identique n'est ni un remplissage ni un écrasement. */
    SAME: 'Identique à la fiche',

    NOTHING: 'Le registre ne rend rien de plus que ce que porte déjà la fiche.',
    NONE_PICKED: 'Cochez au moins un champ.',

    FILLED: (n: number) =>
      `${n} champ${n > 1 ? 's' : ''} rempli${n > 1 ? 's' : ''} — pensez à enregistrer`,

    /**
     * Le registre ne rend ni la population ni l'e-mail, deux des six critères
     * de complétude. Le dire ici évite qu'on croie la fiche complétée alors
     * que le devis reste bloqué — voir
     * `docs/DEMANDE-API-REGISTRE-POPULATION.md`.
     */
    NOT_COVERED:
      'La population et l’email ne figurent pas au registre : ils restent à saisir.',
  },

  UNASSIGNED: 'Non affecté',
  EMPTY_VALUE: '—',
} as const;
