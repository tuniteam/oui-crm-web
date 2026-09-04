import type { Tone } from '@/shared/constants/tone';
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

/**
 * Couleur de chaque valeur, a cote de son libelle.
 *
 * Une progression : on ne contacte pas encore (neutre), on doit contacter
 * (info), on prospecte (marque), un rendez-vous est pose (alerte, il engage
 * une date), c'est clos (neutre a nouveau). Le neutre encadre le parcours,
 * la couleur marque ce qui est en cours.
 */
export const SALES_STATUS_TONES: Record<SalesStatus, Tone> = {
  NOT_CONTACTED: 'secondary',
  TO_CONTACT: 'info',
  IN_PROGRESS: 'primary',
  MEETING_SCHEDULED: 'warning',
  CLOSED: 'secondary',
};

/**
 * Le client actif est le seul succes ; suspendu et resilie sont des alertes
 * de gravite croissante. « Non client » reste neutre : c'est l'etat de depart
 * de toute fiche, le colorer ferait clignoter la liste entiere.
 */
export const CUSTOMER_STATUS_TONES: Record<CustomerStatus, Tone> = {
  NOT_CUSTOMER: 'secondary',
  DEPLOYING: 'info',
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TERMINATED: 'destructive',
  LOST_BEFORE_GOLIVE: 'destructive',
};

/** Seule la priorite haute merite d'attirer l'oeil ; sinon la colonne crie. */
export const PRIORITY_TONES: Record<Priority, Tone> = {
  LOW: 'secondary',
  NORMAL: 'secondary',
  HIGH: 'destructive',
};

export const ORGANIZATIONS_UI = {
  /**
   * Fiche ouverte, portee par l'URL — meme principe que le panneau de
   * Parametres. Sans cela, un doublon signale a la creation ne pouvait pas
   * etre propose a l'ouverture : il n'y avait aucune adresse a viser.
   */
  PANEL_PARAM: 'fiche',
  /** Onglet ouvert du panneau : un lien depuis l'agenda vise les actions. */
  TAB_PARAM: 'onglet',
  /** Ligne a mettre en avant dans l'onglet, s'il en gere une. */
  ANCHOR_PARAM: 'action',

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
    DEPARTMENT_PLACEHOLDER: 'Dépt.',
    ALL_SOLUTIONS: 'Toutes solutions',
    ALL_TAGS: 'Toutes étiquettes',
    RESET: 'Réinitialiser',
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

/**
 * Le sélecteur d'organisme — recherche serveur.
 *
 * `GET /organizations` plafonne à cent lignes par page : une liste déroulante
 * simple s'arrêtait au centième organisme sans le dire. On cherche donc, et on
 * annonce ce qui reste au-delà des résultats montrés.
 */
export const ORGANIZATION_PICKER = {
  PLACEHOLDER: 'Choisir un organisme',
  SEARCH: 'Nom, ville ou SIRET…',
  EMPTY: 'Aucun organisme ne correspond',
  /** Hors périmètre, le serveur refuse la création : la ligne reste inerte. */
  RESTRICTED: (name: string) => `${name} — hors de votre périmètre`,
  MORE: (shown: number, total: number) =>
    `${shown} sur ${total} — affinez votre recherche`,
} as const;
