import type { CampaignStatus } from '../types/campaign';

/** Campagnes — L1 · US-01-11. Routes scopées projet. */
export const CAMPAIGN_ROUTES = {
  CAMPAIGNS_API: '/campaigns',
  CAMPAIGN_API: (id: string) => `/campaigns/${id}`,
  CAMPAIGN_STATUS_API: (id: string) => `/campaigns/${id}/status`,
  CAMPAIGN_ORGANIZATIONS_API: (id: string) => `/campaigns/${id}/organizations`,
  CAMPAIGN_ORGANIZATION_API: (id: string, orgId: string) =>
    `/campaigns/${id}/organizations/${orgId}`,
  CAMPAIGN_RESULTS_API: (id: string) => `/campaigns/${id}/results`,
} as const;

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'En cours',
  CLOSED: 'Close',
};

/** Ce que fait le passage à ce statut, dit du point de vue de l'utilisateur. */
export const CAMPAIGN_TRANSITION_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Repasser en brouillon',
  ACTIVE: 'Lancer la campagne',
  CLOSED: 'Clore la campagne',
};

export const CAMPAIGNS_UI = {
  TITLE: 'Campagnes',
  SUBTITLE:
    'Un ciblage nommé, daté et mesuré. La campagne fige une liste d’organismes et suit ce qu’elle produit.',

  ADD: 'Nouvelle campagne',

  CARD: {
    /** `owner` peut être absent : le serveur ne garantit pas un responsable. */
    UNASSIGNED: 'Non affectée',
    PERIOD: (start: string, end: string) => `du ${start} au ${end}`,
    PERIOD_FROM: (start: string) => `depuis le ${start}`,
    PERIOD_UNTIL: (end: string) => `jusqu’au ${end}`,
    NO_PERIOD: 'Sans période',
    /** Les critères sont **documentaires** : ils disent comment la cible a été
     *  construite, ils ne la reconstruisent pas. */
    CRITERIA: 'Critère de ciblage',
    NO_CRITERIA: 'Cible constituée à la main',
    ORGANIZATIONS: (n: number) =>
      n === 0
        ? 'Aucun organisme ciblé'
        : `Voir les ${n} organisme${n > 1 ? 's' : ''}`,
  },

  /** Les quatre barres de la maquette. Seule la première est alimentée au L1. */
  RESULTS: {
    ACTIVITIES: 'Actions',
    OPPORTUNITIES: 'Opportunités',
    QUOTES: 'Devis',
    SIGNED: 'Signés',
    PENDING_HINT: 'Alimenté à partir du lot L2.',
  },

  FILTER_ALL_STATUSES: 'Tous les statuts',

  EMPTY: {
    TITLE: 'Aucune campagne',
    DESCRIPTION:
      'Créez une campagne pour cibler un ensemble d’organismes et mesurer ce qu’elle rapporte.',
  },

  ACTIONS: {
    EDIT: 'Modifier',
    DELETE: 'Supprimer',
    RESULTS: 'Voir le détail',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les campagnes',
    NAME_TAKEN: 'Ce nom est déjà utilisé par une autre campagne.',
  },

  TOASTS: {
    CREATED: 'Campagne créée',
    UPDATED: 'Campagne modifiée',
    STATUS_CHANGED: 'Statut mis à jour',
    DELETED: 'Campagne supprimée',
  },
} as const;

export const CAMPAIGN_WINDOW = {
  CREATE_TITLE: 'Nouvelle campagne',
  EDIT_TITLE: 'Modifier la campagne',

  FIELDS: {
    NAME: 'Nom',
    NAME_PLACEHOLDER: 'Campagne rentrée scolaire 2027',
    DESCRIPTION: 'Objectif',
    DESCRIPTION_PLACEHOLDER: 'Périmètre, message, objectif chiffré',
    OWNER: 'Responsable',
    OWNER_DEFAULT: 'Moi',
    START: 'Début',
    END: 'Fin',
  },

  HINTS: {
    /**
     * La maquette propose six filtres de ciblage dans cette fenêtre, ce qui
     * suggérerait une cible qui se recalcule. Elle ne se recalcule pas : la
     * liste se remplit par une action dédiée, et les critères ne sont qu'une
     * note. Le champ est donc absent, et l'écran le dit.
     */
    TARGET:
      'La cible se remplit après la création, depuis la campagne ou la liste des organismes.',
  },

  ACTIONS: {
    SAVE: 'Enregistrer',
    CREATE: 'Créer la campagne',
    CANCEL: 'Annuler',
  },
} as const;

export const CAMPAIGN_TARGET_UI = {
  TITLE: 'Organismes ciblés',
  /** La cible est figée : elle ne suit pas les critères, elle se remplit. */
  SUBTITLE:
    'Liste figée : elle ne se recalcule pas depuis les critères. Ajoutez ou retirez des organismes ici.',

  ADD: 'Ajouter des organismes',
  REMOVE: 'Retirer',
  CLOSE: 'Fermer',

  /**
   * Les trois nombres, toujours. Un « enregistré » masquerait les fiches qui
   * n'ont pas suivi — déjà présentes, ou hors du périmètre de l'appelant.
   */
  REPORT: (added: number, alreadyIn: number, skipped: number) => {
    const parts = [`${added} ajouté${added > 1 ? 's' : ''}`];
    if (alreadyIn > 0) parts.push(`${alreadyIn} déjà présent${alreadyIn > 1 ? 's' : ''}`);
    if (skipped > 0) parts.push(`${skipped} ignoré${skipped > 1 ? 's' : ''}`);
    return parts.join(', ');
  },

  REMOVED: 'Organisme retiré de la cible',

  /** Une fiche hors périmètre reste dans la cible, en projection restreinte :
   *  on la signale plutôt que de la masquer. */
  RESTRICTED: 'Hors de votre périmètre',

  EMPTY: {
    TITLE: 'Cible vide',
    DESCRIPTION:
      'Ajoutez des organismes pour que la campagne ait quelque chose à mesurer.',
  },

  /** Cibler une fiche non contactée la fait passer « À contacter ». */
  SIDE_EFFECT:
    'Une fiche encore « Non contacté » passera « À contacter » en entrant dans la cible.',

  PICKER: {
    TITLE: 'Ajouter des organismes',
    SEARCH: 'Nom, ville ou SIRET…',
    SELECTED: (n: number) => `${n} sélectionné${n > 1 ? 's' : ''}`,
    CONFIRM: 'Ajouter à la cible',
    CANCEL: 'Annuler',
    LIMIT: 'Cinq cents organismes au maximum par ajout.',
  },
} as const;

/** Codes d'erreur routés par l'écran. */
export const CAMPAIGN_ERRORS = {
  NAME_EXISTS: 'CAMPAIGN_NAME_EXISTS',
  INVALID_TRANSITION: 'INVALID_STATUS_TRANSITION',
  IN_USE_BY_SCOPE: 'CAMPAIGN_IN_USE_BY_SCOPE',
} as const;

/**
 * Le detail des resultats — L1 · US-01-11, tranche C.
 *
 * Les totaux sont ceux du serveur, jamais la somme des lignes affichees.
 */
export const CAMPAIGN_RESULTS_UI = {
  TITLE: 'Résultats',
  SUBTITLE:
    'Calculés à la demande, à partir des actions rattachées à la campagne.',

  /** Porte sur **toute** la campagne, pas sur la page : le dire évite de
   *  croire que le nombre suivra la pagination. */
  TOTALS: 'Total de la campagne',

  COLUMNS: {
    ORGANIZATION: 'Organisme',
    SALES_STATUS: 'Statut commercial',
    ACTIVITIES: 'Actions',
    LAST_ACTIVITY: 'Dernière action',
  },

  /** Une fiche ciblée sans action reste dans la liste, à zéro : la faire
   *  disparaître cacherait justement celles qu'il reste à travailler. */
  NEVER: 'Aucune',
  /**
   * Hors périmètre, le contrat **retire** `lastActivityAt` de la charge utile.
   * Afficher « Aucune » serait un mensonge : la fiche peut très bien avoir
   * produit des actions, on n'a simplement pas le droit de les dater.
   */
  NOT_DISCLOSED: 'Non communiqué',

  /** Même signalement que dans la cible, pour la même raison. */
  RESTRICTED: 'Hors de votre périmètre',

  EMPTY: {
    TITLE: 'Rien à mesurer',
    DESCRIPTION:
      'La cible est vide : ajoutez des organismes pour que la campagne produise des résultats.',
  },

  ERRORS: {
    FETCH: 'Impossible de charger les résultats',
  },

  CLOSE: 'Fermer',
} as const;

/**
 * La suppression, et son refus — L1 · US-01-11, tranche C.
 *
 * `409 CAMPAIGN_IN_USE_BY_SCOPE` nomme les perimetres fautifs. On les affiche
 * et on **guide** la dissociation ; on ne modifie jamais un perimetre sans que
 * son administrateur l'ait demande, c'est du controle d'acces.
 */
export const CAMPAIGN_DELETE_UI = {
  TITLE: 'Supprimer la campagne',
  CONFIRM: (name: string) =>
    `« ${name} » sera supprimée. Les organismes ciblés ne sont pas touchés.`,

  BLOCKED_TITLE: 'Suppression impossible',
  BLOCKED: (n: number) =>
    n > 1
      ? `${n} périmètres citent cette campagne. Détachez-la de chacun, puis relancez la suppression.`
      : 'Un périmètre cite cette campagne. Détachez-la, puis relancez la suppression.',
  /** Le serveur a refusé sans nommer : on le dit plutôt que d'inventer. */
  BLOCKED_UNNAMED:
    'Un périmètre cite cette campagne, sans que le serveur ait dit lequel. Vérifiez les périmètres du projet.',
  DETACH: 'Détacher',
  DETACHED: 'Campagne détachée du périmètre',

  ACTIONS: {
    DELETE: 'Supprimer',
    CANCEL: 'Annuler',
    CLOSE: 'Fermer',
  },
} as const;

/**
 * Pagination de la cible et des résultats — L1 · US-01-11.
 *
 * Les deux routes rendent vingt lignes par page.
 */
export const CAMPAIGN_PAGER = {
  POSITION: (page: number, pages: number, total: number) =>
    `Page ${page} sur ${pages} · ${total} organisme${total > 1 ? 's' : ''}`,
  PREVIOUS: 'Précédent',
  NEXT: 'Suivant',
} as const;
