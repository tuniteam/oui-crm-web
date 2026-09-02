/** Creation d'un organisme — US-01-02. Libelles de l'ecran V8 `openCreateOrg`. */

export const CREATE_MODES = {
  REGISTRY: 'registry',
  MANUAL: 'manual',
} as const;

export type CreateMode = (typeof CREATE_MODES)[keyof typeof CREATE_MODES];

export const CREATE_ORGANIZATION_UI = {
  TITLE: 'Nouvel organisme',
  DESCRIPTION:
    'Recherchez la structure au registre officiel, ou saisissez la fiche manuellement.',

  MODES: {
    REGISTRY: 'Recherche officielle',
    MANUAL: 'Saisie manuelle',
  },

  REGISTRY: {
    LABEL: 'Nom de l’organisme ou numéro SIRET',
    PLACEHOLDER: 'Mairie de Bayeux — ou 21140047400015',
    HINT: 'Interroge le registre officiel : SIRET, adresse, code INSEE et département.',
    SEARCH: 'Rechercher',
    SEARCHING: 'Recherche en cours…',
    /** L'API exige au moins trois caracteres (400 INVALID_DATA). */
    MIN_LENGTH: 3,
    TOO_SHORT: 'Saisissez au moins trois caractères.',
    NO_RESULT:
      'Aucun établissement trouvé. Basculez sur la saisie manuelle pour créer la fiche.',
    /**
     * Le registre est une commodite, pas un passage oblige : son indisponibilite
     * est un cas nominal du contrat, pas une erreur a signaler comme un echec.
     */
    UNAVAILABLE:
      'Le registre officiel ne répond pas. Vous pouvez saisir la fiche manuellement.',
    INACTIVE: 'Établissement fermé au registre',
    USE: 'Utiliser cette fiche',
    IDENTIFIERS: (siret: string, insee: string) =>
      `SIRET ${siret} · INSEE ${insee}`,
  },

  DUPLICATE: {
    TITLE: 'Un organisme semblable existe déjà',
    DESCRIPTION:
      'Même nom au même code postal. Vérifiez avant de créer une seconde fiche.',
    OPEN: 'Ouvrir la fiche',
    CONFIRM: 'Créer quand même',
    CANCEL: 'Revenir à la saisie',
  },

  FIELDS: {
    NAME: 'Nom de l’organisme',
    TYPE: 'Type de structure',
    TYPE_PLACEHOLDER: 'Choisir un type',
    SIRET: 'SIRET',
    SIRET_PLACEHOLDER: '14 chiffres',
    INSEE: 'Code INSEE',
    ADDRESS: 'Adresse',
    POSTAL_CODE: 'Code postal',
    CITY: 'Ville',
    DEPARTMENT: 'Département',
    POPULATION: 'Population',
    EPCI: 'EPCI',
    PHONE: 'Téléphone',
    EMAIL: 'Email',
    SOLUTION: 'Solution en place',
    SOLUTION_PLACEHOLDER: 'Non renseignée',
    PRIORITY: 'Priorité',
  },

  SECTIONS: {
    IDENTITY: 'Identité',
    LOCATION: 'Localisation',
    CONTACT: 'Contact',
    COMMERCIAL: 'Suivi commercial',
  },

  ACTIONS: {
    CREATE: 'Créer la fiche',
    CANCEL: 'Annuler',
  },

  TOAST_CREATED: 'Organisme créé',

  /**
   * Deux champs de la V8 ne sont pas repris.
   *
   * La **strate tarifaire** y est calculee dans le navigateur a partir de la
   * population. Ici elle est rendue par l'API (`bracketLabel`) et jamais
   * recalculee : avant creation il n'y a pas de fiche, donc pas de strate a
   * montrer. Elle apparait sur la fiche, une fois l'organisme cree.
   *
   * Le **contact principal** n'a pas de place dans `POST /organizations` : les
   * contacts sont une route distincte (US-01-04), non developpee.
   */
} as const;

/** Codes d'erreur de `POST /organizations`, routes par le formulaire. */
export const CREATE_ORGANIZATION_ERRORS = {
  POSSIBLE_DUPLICATE: 'ORGANIZATION_POSSIBLE_DUPLICATE',
  SIRET_EXISTS: 'ORGANIZATION_SIRET_EXISTS',
  INSEE_CODE_EXISTS: 'ORGANIZATION_INSEE_CODE_EXISTS',
  INVALID_REFERENCE_VALUE: 'INVALID_REFERENCE_VALUE',
} as const;

/** Messages sous le champ fautif, plutot que dans un toast qui disparait. */
export const CREATE_ORGANIZATION_FIELD_ERRORS = {
  [CREATE_ORGANIZATION_ERRORS.SIRET_EXISTS]: {
    field: 'siret',
    message: 'Ce SIRET est déjà utilisé par une fiche du projet.',
  },
  [CREATE_ORGANIZATION_ERRORS.INSEE_CODE_EXISTS]: {
    field: 'inseeCode',
    message: 'Ce code INSEE est déjà utilisé par une fiche du projet.',
  },
} as const;

/** Codes de `GET /organizations/search-registry` qui font basculer en manuel. */
export const REGISTRY_DEGRADED_CODES = [
  'REGISTRY_UNAVAILABLE',
  'REGISTRY_TIMEOUT',
] as const;
