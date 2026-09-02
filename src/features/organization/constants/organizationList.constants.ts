import type {
  CustomerStatus,
  Priority,
  SalesStatus,
} from '../types/organizationList';

/**
 * Libelles repris **tels quels** de la maquette V8 (`STAT_COM`, `STAT_CLIENT`,
 * `PRIORITES`), dans son ordre. La correspondance avec les enumerations du
 * contrat est exacte, valeur pour valeur.
 */
export const SALES_STATUS_LABELS: Record<SalesStatus, string> = {
  NOT_CONTACTED: 'Non contacté',
  TO_CONTACT: 'À contacter',
  IN_PROGRESS: 'En cours de prospection',
  MEETING_SCHEDULED: 'RDV programmé',
  CLOSED: 'Clôturé',
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  NOT_CUSTOMER: 'Non client',
  DEPLOYING: 'Client en déploiement',
  ACTIVE: 'Client actif',
  SUSPENDED: 'Client suspendu',
  TERMINATED: 'Client résilié',
  LOST_BEFORE_GOLIVE: 'Client perdu avant production',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Basse',
  NORMAL: 'Normale',
  HIGH: 'Haute',
};

export const ORGANIZATIONS_UI = {
  TITLE: 'Organismes',
  SUBTITLE:
    'La base de référence : communes, syndicats, EPCI, crèches et associations gestionnaires, avec leur environnement périscolaire et leur suivi.',

  TABLE_HEADERS: {
    NAME: 'Organisme',
    TYPE: 'Type',
    DEPARTMENT: 'Dépt.',
    POPULATION: 'Population',
    BRACKET: 'Strate',
    SOLUTION: 'Solution en place',
    SALES_STATUS: 'Statut commercial',
    CUSTOMER_STATUS: 'Statut client',
    PRIORITY: 'Priorité',
    NEXT_ACTIVITY: 'Prochaine action',
    SALES_REP: 'Commercial',
    ACTIONS: 'Actions',
  },

  SEARCH: {
    /* La V8 annonce « Nom, ville, code postal, SIRET, contact… ». L'API ne
       cherche que le nom, la ville, et le debut du SIRET si la saisie est
       numerique — verifie : « 14000 » et « Lemarchand » ne rendent rien. Le
       placeholder dit donc ce que la recherche fait vraiment. */
    PLACEHOLDER: 'Nom, ville ou SIRET…',
    TOOLTIP:
      'Recherche sur le nom et la ville. Une saisie numérique cherche aussi le début du SIRET.',
    ALL_TYPES: 'Tous les types',
    ALL_SALES_STATUSES: 'Statut commercial',
    ALL_CUSTOMER_STATUSES: 'Statut client',
    ALL_PRIORITIES: 'Toutes priorités',
    TYPE_PLACEHOLDER: 'Type',
    INCOMPLETE_ONLY: 'Fiches incomplètes',
  },

  RESTRICTED: {
    /** Meme intention que le `tr.restricted` de la V8. */
    HINT: 'hors de votre périmètre',
  },

  UNASSIGNED: 'Non affecté',
  EMPTY_VALUE: '—',

  EMPTY_STATE: {
    ILLUSTRATION: '/media/illustrations/projects.svg',
    TITLE: 'Aucun organisme',
    DESCRIPTION: [
      'Aucun organisme ne correspond à votre recherche.',
      'Créez une fiche pour commencer à prospecter.',
    ],
    TIP: {
      TITLE: 'Le registre officiel remplit la fiche pour vous',
      CONTENT:
        'À la création, une recherche par nom ou par SIRET pré-remplit l’adresse, le code INSEE et le département.',
    },
  },

  ACTIONS: {
    NEW: 'Nouvel organisme',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les organismes',
  },
} as const;
