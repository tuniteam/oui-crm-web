import { STATUS_CONFIG } from '@/components/shared/status-config';

/** Statuts d'un projet. Source de verite : enum ProjectStatus de l'API. */
export const PROJECT_STATUS_VALUES = ['DRAFT', 'ACTIVE', 'ARCHIVED'] as const;

export const PROJECT_STATUS = {
  DRAFT: PROJECT_STATUS_VALUES[0],
  ACTIVE: PROJECT_STATUS_VALUES[1],
  ARCHIVED: PROJECT_STATUS_VALUES[2],
} as const;

/**
 * Options du filtre de statut. Les libelles sont derives de STATUS_CONFIG,
 * qui pilote deja les badges : une seule source pour le badge et le filtre.
 */
export const PROJECT_STATUS_OPTIONS = PROJECT_STATUS_VALUES.map((value) => ({
  value,
  label: STATUS_CONFIG[value]?.label ?? value,
}));

/** Fonctionnalites activables. Source de verite : enum FeatureCode de l'API. */
export const FEATURE_CODE_VALUES = [
  'SALES',
  'BILLING',
  'SUPPORT',
  'STATS',
] as const;

export const FEATURE_LABELS: Record<
  (typeof FEATURE_CODE_VALUES)[number],
  string
> = {
  SALES: 'Ventes',
  BILLING: 'Facturation',
  SUPPORT: 'Support',
  STATS: 'Statistiques',
};

export const TABLE_HEADERS = {
  NAME: 'Projet',
  PRODUCT: 'Produit',
  STATUS: 'Statut',
  FEATURES: 'Fonctionnalités',
  USER_COUNT: 'Utilisateurs',
  CREATED_AT: 'Créé le',
  ACTIONS: 'Actions',
} as const;

export const ACTIONS = {
  NEW_PROJECT: 'Nouveau projet',
  VIEW_PROJECT: 'Voir le projet',
  OPEN_PROJECT: 'Ouvrir le projet dans un onglet',
} as const;

export const SEARCH = {
  PLACEHOLDER: 'Rechercher un projet…',
  TOOLTIP_TEXT: 'Recherche par nom, identifiant ou produit',
  STATUS_PLACEHOLDER: 'Statut',
  ALL_STATUSES_SELECT_OPTION: 'Tous les statuts',
} as const;

export const PROJECTS_TABLE_UI = {
  EMPTY_STATE: {
    TITLE: 'Aucun projet',
    DESCRIPTION: [
      'Aucun projet ne correspond à votre recherche.',
      'Créez un projet pour commencer.',
    ],
    TIP: {
      TITLE: 'À savoir',
      CONTENT: [
        'Un projet est créé en brouillon : il reste fermé à ses utilisateurs tant qu’il n’est pas activé.',
      ],
    },
  },
  NO_FEATURE: 'Aucune',
} as const;

export const PROJECT_INFORMATION_UI = {
  TABS: {
    INFORMATION: {
      VALUE: 'informations',
      LABEL: 'Informations',
    },
  },
  SECTIONS: {
    IDENTITY: 'Identité',
    ACTIVITY: 'Activité',
    FEATURES: 'Fonctionnalités',
  },
  FIELDS: {
    NAME: 'Nom',
    SLUG: 'Identifiant',
    PRODUCT: 'Produit',
    DESCRIPTION: 'Description',
    STATUS: 'Statut',
    USER_COUNT: 'Utilisateurs',
    ACTIVATED_AT: 'Activé le',
    CREATED_AT: 'Créé le',
    UPDATED_AT: 'Modifié le',
  },
  FEATURES: {
    ENABLED: 'Activée',
    DISABLED: 'Désactivée',
    EMPTY: 'Aucune fonctionnalité déclarée.',
  },
  FALLBACK: '—',
} as const;

export const PROJECT_NOT_FOUND = {
  TITLE: 'Projet introuvable',
  DESCRIPTION: "Ce projet n'existe pas ou a été supprimé.",
  BACK: 'Retour aux projets',
} as const;

export const ERRORS = {
  FETCH_PROJECTS: 'Impossible de récupérer les projets.',
} as const;

/**
 * Les règles d'un projet, relevées dans `CreateProjectDto` et
 * `projects.constants.ts` de l'API — pas choisies ici.
 *
 * L'identifiant est **définitif** : il sert dans les URL et les noms de
 * fichiers d'export, et aucune route ne le modifie ensuite. D'où le soin mis à
 * le contrôler avant l'envoi plutôt qu'après un `400`.
 */
export const PROJECT_RULES = {
  SLUG_MIN: 2,
  SLUG_MAX: 50,
  SLUG_PATTERN: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  NAME_MAX: 100,
  DESCRIPTION_MAX: 1000,
} as const;

/** Codes d'erreur de `POST /projects`, relevés dans le service de l'API. */
export const PROJECT_ERROR_CODES = {
  /** 409 — un projet porte déjà cet identifiant. */
  SLUG_EXISTS: 'PROJECT_SLUG_EXISTS',
  /**
   * 404 — le projet à copier n'existe pas.
   *
   * Absent du handoff, qui laissait la case vide : relevé dans
   * `getProjectOrThrow`, qui lève `PROJECT_NOT_FOUND`.
   */
  SOURCE_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVALID_DATA: 'INVALID_DATA',
} as const;

export const CREATE_PROJECT_UI = {
  TITLE: 'Nouveau projet',
  /**
   * Ce que la création fait vraiment, dit avant de valider : un projet naît
   * en brouillon, fermé à ses utilisateurs, et vide de membres. Sans cette
   * phrase, on s'attend à pouvoir y inviter quelqu'un aussitôt.
   */
  DESCRIPTION:
    'Le projet est créé en brouillon, sans membre ni organisme. Il reste fermé à ses utilisateurs tant qu’il n’est pas activé.',
  FIELDS: {
    NAME: 'Nom du projet',
    SLUG: 'Identifiant',
    PRODUCT: 'Produit vendu',
    DESCRIPTION: 'Description',
    COPY_FROM: 'Copier la configuration de…',
  },
  PLACEHOLDERS: {
    NAME: 'Périscolia',
    SLUG: 'periscolia',
    PRODUCT: 'Périscolia — gestion périscolaire',
    DESCRIPTION: 'Logiciel de gestion périscolaire vendu aux collectivités.',
    COPY_FROM: 'Aucun — partir de la configuration par défaut',
  },
  HINTS: {
    /** La phrase du handoff, et la seule qui dise pourquoi on doit s'appliquer. */
    SLUG: 'Identifiant définitif, utilisé dans les URL et les exports.',
    SLUG_AUTO: 'Proposé depuis le nom ; modifiable tant que le projet n’est pas créé.',
    COPY_FROM:
      'Reprend les paramètres, référentiels, périmètres, grille tarifaire, gabarits et cachet — jamais les données métier.',
  },
  /** La valeur « aucun projet source » : Radix refuse une option à valeur vide. */
  NO_SOURCE: '__none__',
  ERRORS: {
    REQUIRED: 'Ce champ est obligatoire.',
    TOO_LONG: (max: number) => `${max} caractères au maximum.`,
    SLUG_LENGTH: `Entre ${PROJECT_RULES.SLUG_MIN} et ${PROJECT_RULES.SLUG_MAX} caractères.`,
    SLUG_FORMAT:
      'Minuscules, chiffres et tirets simples uniquement, sans tiret au début ni à la fin.',
    SLUG_EXISTS: 'Cet identifiant est déjà utilisé.',
    SOURCE_NOT_FOUND: 'Projet source introuvable.',
    CREATE: 'Impossible de créer le projet.',
  },
  CREATED: (name: string) => `Projet « ${name} » créé en brouillon.`,
} as const;

/**
 * Codes de `POST /projects/:id/status`, relevés dans `changeStatus` de l'API.
 *
 * `409` quand le projet a changé de statut entre l'affichage et le clic —
 * activé dans un autre onglet, typiquement ; `404` quand il a disparu.
 */
export const PROJECT_STATUS_ERROR_CODES = {
  INVALID_TRANSITION: 'INVALID_STATUS_TRANSITION',
  NOT_FOUND: 'PROJECT_NOT_FOUND',
  /**
   * 400 — le nom ressaisi diffère du nom exact. L'API compare par `!==` :
   * casse, accents et espaces compris.
   */
  NAME_MISMATCH: 'PROJECT_NAME_MISMATCH',
  /** 409 — le projet contient des données métier ; `meta` porte les compteurs. */
  NOT_EMPTY: 'PROJECT_NOT_EMPTY',
} as const;

export const ACTIVATE_PROJECT_UI = {
  BUTTON: 'Activer le projet',
  /** La carte de la zone, quand le projet est en brouillon. */
  CARD_TITLE: 'Activer le projet',
  CARD_DESCRIPTION:
    'Ses membres pourront s’y connecter. Un projet actif ne revient plus en brouillon, seulement archivé.',
  /**
   * La confirmation dit **ce qui change** et **ce qui ne reviendra pas** : pas
   * de retour en brouillon, seulement l'archivage. C'est une action
   * irréversible — la seule de la fiche.
   */
  TITLE: (name: string) => `Activer « ${name} » ?`,
  LEAD: 'Les membres du projet pourront s’y connecter. Un projet actif ne peut plus revenir en brouillon, seulement être archivé.',
  CONFIRM: 'Activer',
  CANCEL: 'Annuler',
  DONE: 'Projet activé',
  FAILED: 'Impossible d’activer le projet.',
} as const;

/**
 * Un seul message pour un `409 INVALID_STATUS_TRANSITION`, quel que soit le
 * geste : l'activation et l'archivage le formulaient différemment dans leurs
 * handoffs, pour dire la même chose.
 */
export const PROJECT_STATUS_CHANGED = 'Ce projet a déjà changé de statut';

/** Restaurer : `ARCHIVED → ACTIVE`, confirmation simple, sans ressaisie. */
export const RESTORE_PROJECT_UI = {
  BUTTON: 'Restaurer le projet',
  /** La carte de la zone, quand le projet est archivé. */
  CARD_TITLE: 'Restaurer le projet',
  CARD_DESCRIPTION:
    'Il redevient actif et ses membres retrouvent leur accès. Sa date d’activation d’origine est conservée.',
  TITLE: (name: string) => `Restaurer « ${name} » ?`,
  LEAD: 'Le projet redevient actif : ses membres y retrouvent leur accès. Sa date d’activation d’origine est conservée.',
  CONFIRM: 'Restaurer',
  CANCEL: 'Annuler',
  DONE: 'Projet restauré',
  FAILED: 'Impossible de restaurer le projet.',
} as const;

/** La zone « danger » de la fiche : les gestes qui retirent le projet. */
export const PROJECT_DANGER_UI = {
  TITLE: 'Zone de danger',
  ARCHIVE: {
    TITLE: 'Archiver le projet',
    DESCRIPTION:
      'Ses membres n’y ont plus accès. Les données sont conservées et le projet peut être restauré.',
    BUTTON: 'Archiver le projet',
    WINDOW_TITLE: (name: string) => `Archiver « ${name} » ?`,
    LEAD: 'Les membres du projet n’y auront plus accès. Les données sont conservées et le projet pourra être restauré.',
    CONFIRM: 'Archiver',
    DONE: 'Projet archivé',
    FAILED: 'Impossible d’archiver le projet.',
  },
  DELETE: {
    TITLE: 'Supprimer le projet',
    DESCRIPTION:
      'Suppression définitive, possible seulement si le projet ne contient aucune donnée métier. Sinon, archivez-le.',
    BUTTON: 'Supprimer le projet',
    WINDOW_TITLE: (name: string) => `Supprimer définitivement « ${name} » ?`,
    /** Le texte du handoff : ce qui part, et qui perd son compte. */
    LEAD: [
      'La configuration du projet et ses fichiers seront supprimés.',
      'Les membres rattachés uniquement à ce projet perdront leur compte (et leur photo de profil).',
      'Cette action est irréversible.',
    ],
    CONFIRM: 'Supprimer',
    DONE: 'Projet supprimé',
    FAILED: 'Impossible de supprimer le projet.',
    /**
     * Le refus d'un projet non vide, dit avec ses compteurs.
     *
     * Ils arrivent dans `messages.meta` — seuls les non nuls — justement pour
     * ne pas analyser la phrase du serveur.
     */
    NOT_EMPTY: (name: string, contents: string) =>
      `Impossible de supprimer « ${name} » : il contient ${contents}.`,
    NOT_EMPTY_ARCHIVE: 'Vous pouvez l’archiver à la place.',
    NOT_EMPTY_DRAFT:
      'Un projet en brouillon ne s’archive pas : activez-le d’abord, ou retirez ses données.',
  },
  /** La ressaisie du nom, commune à l'archivage et à la suppression. */
  CONFIRM_NAME: {
    LABEL: 'Pour confirmer, saisissez le nom exact du projet :',
    MISMATCH: 'Le nom ne correspond pas.',
    CANCEL: 'Annuler',
  },
} as const;

/**
 * Les compteurs de `PROJECT_NOT_EMPTY`, en français — singulier, pluriel.
 * Les clés viennent de `countProjectData` dans l'API.
 */
export const PROJECT_DATA_LABELS: Record<string, readonly [string, string]> = {
  organizations: ['organisme', 'organismes'],
  contacts: ['contact', 'contacts'],
  activities: ['action', 'actions'],
  campaigns: ['campagne', 'campagnes'],
  opportunities: ['opportunité', 'opportunités'],
  quotes: ['devis', 'devis'],
  contracts: ['contrat', 'contrats'],
};
