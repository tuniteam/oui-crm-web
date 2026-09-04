import type { BulkAction, BulkPayload, BulkSkipReason } from '../types/bulk';
import type { Priority, SalesStatus } from '../types/organizationList';

/** Actions groupées — L1 · US-01-05. Route scopée projet. */
export const BULK_ROUTES = {
  BULK_API: '/organizations/bulk',
} as const;

/** Les listes de choix se chargent d'un coup : le contrat plafonne à 100. */
export const BULK_OPTIONS_LIMIT = 100;

/**
 * Le contrat refuse une sélection de plus de 500 identifiants
 * (`400 INVALID_DATA`). Le plafond est atteignable : la sélection persiste
 * d'une page à l'autre, six pages de cent suffisent. Mieux vaut le dire avant
 * l'appel que traduire un refus après.
 */
export const BULK_MAX_IDS = 500;

export const BULK_ACTION_LABELS: Record<BulkAction, string> = {
  ASSIGN_SALES_REP: 'Affecter un commercial',
  SET_SALES_STATUS: 'Changer le statut commercial',
  SET_PRIORITY: 'Changer la priorité',
  ADD_TO_CAMPAIGN: 'Ajouter à une campagne',
  DELETE: 'Supprimer',
};

/**
 * Ce que chaque action réclame, en un seul endroit.
 *
 * Le contrat exige **exactement** le champ de l'action, sinon `400
 * INVALID_DATA`. Décrire ce lien trois fois — pour construire la charge utile,
 * pour peupler le sélecteur, pour son libellé — le ferait diverger : une
 * action ajoutée sans son entrée casse ici, à la compilation, plutôt qu'à
 * l'exécution.
 */
export const BULK_FIELDS: Record<
  BulkAction,
  | { needsValue: false }
  | {
      needsValue: true;
      label: string;
      /** D'où viennent les choix, et sous quel champ la valeur part. */
      source: 'users' | 'campaigns' | 'salesStatus' | 'priority';
      toPayload: (value: string) => BulkPayload;
    }
> = {
  ASSIGN_SALES_REP: {
    needsValue: true,
    label: 'Commercial',
    source: 'users',
    toPayload: (salesRepId) => ({ salesRepId }),
  },
  SET_SALES_STATUS: {
    needsValue: true,
    label: 'Statut commercial',
    source: 'salesStatus',
    toPayload: (value) => ({ salesStatus: value as SalesStatus }),
  },
  SET_PRIORITY: {
    needsValue: true,
    label: 'Priorité',
    source: 'priority',
    toPayload: (value) => ({ priority: value as Priority }),
  },
  ADD_TO_CAMPAIGN: {
    needsValue: true,
    label: 'Campagne',
    source: 'campaigns',
    toPayload: (campaignId) => ({ campaignId }),
  },
  DELETE: { needsValue: false },
};

/**
 * La fenêtre d'une action groupée.
 *
 * Une action, une fenêtre : c'est là qu'on choisit la valeur, qu'on rappelle
 * l'étendue et qu'on confirme. Ne rien promettre que le serveur n'applique
 * pas — `409 ORGANIZATION_HAS_CONTRACTS` est annoncé **au lot L3**, aucune
 * fiche n'est protégée aujourd'hui.
 */
export const BULK_WINDOW = {
  /** L'étendue en chiffres, jamais « la sélection ». */
  SCOPE: (n: number) =>
    `L'action portera sur ${n} fiche${n > 1 ? 's' : ''} sélectionnée${n > 1 ? 's' : ''}.`,
  SCOPE_ALL: (n: number) =>
    `L'action portera sur les ${n} fiches correspondant aux filtres, y compris celles que cet écran n'affiche pas.`,
  DELETE_WARNING:
    'L’action est sans retour depuis cet écran. Les contacts et les actions rattachés partent avec les fiches.',
  DELETE_WARNING_ALL:
    'L’action est sans retour, et cet écran ne peut pas énumérer les fiches qui partiront.',
  CONFIRM: 'Appliquer',
  CANCEL: 'Annuler',
  /** Un champ qui repete son intitule n'apprend rien : l'invite dit le geste. */
  PICK_VALUE: 'Choisir…',
} as const;

export const BULK_UI = {
  SELECTED: (n: number) =>
    `${n} organisme${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}`,

  /**
   * Le piège de cette US, dit à l'écran.
   *
   * Cocher l'en-tête ne coche que **la page courante** — la table ne peut pas
   * faire autrement. Le contrat, lui, sait agir sur tout ce qui correspond aux
   * filtres. Sans cette phrase, on supprime vingt fiches en croyant en
   * supprimer quatre cent trente-sept.
   */
  SELECT_ALL_OFFER: (total: number) =>
    `Étendre aux ${total} fiches des filtres`,
  SELECT_ALL_ACTIVE: (total: number) =>
    `Les ${total} organismes correspondant aux filtres sont sélectionnés.`,
  CLEAR: 'Annuler la sélection',

  /** L'unique commande de la barre : le menu des cinq actions. */
  PICK_ACTION: 'Actions',


  /** Au-delà du plafond, la seule issue est « tout ce qui correspond ». */
  TOO_MANY: (max: number) =>
    `Une action groupée porte sur ${max} fiches au maximum. Réduisez la sélection, ou choisissez toutes les fiches qui correspondent aux filtres.`,

  /**
   * Le compte rendu — et **pourquoi** des fiches n'ont pas suivi.
   *
   * L'appel n'échoue jamais globalement : un « enregistré » masquerait que dix
   * fiches sur cinquante sont restées de côté. Même règle que la cible des
   * campagnes, où les trois nombres sont rendus.
   */
  REPORT: (processed: number, skipped: number) =>
    skipped === 0
      ? `${processed} organisme${processed > 1 ? 's traités' : ' traité'}`
      : `${processed} traité${processed > 1 ? 's' : ''}, ${skipped} ignoré${skipped > 1 ? 's' : ''}`,

  /**
   * Pourquoi une fiche a été ignorée.
   *
   * `NOT_FOUND` couvre aussi les fiches **cachées** à un rôle sans accès hors
   * périmètre : le libellé ne doit rien laisser deviner de leur existence.
   */
  SKIP_REASONS: {
    OUT_OF_SCOPE: 'hors de votre périmètre',
    NOT_FOUND: 'introuvable ou supprimée',
  } satisfies Record<BulkSkipReason, string> as Record<string, string>,

  /** Le détail, groupé par motif : « 2 hors de votre périmètre ». */
  SKIP_DETAIL: (reasons: Record<string, number>) =>
    Object.entries(reasons)
      .map(([reason, n]) => `${n} ${BULK_UI.SKIP_REASONS[reason] ?? reason}`)
      .join(', '),

  /**
   * Les deux `404` du contrat ne sont pas des pannes : ce sont des données qui
   * ont bougé pendant qu'on choisissait. Les confondre avec un échec technique
   * laisse l'utilisateur recommencer à l'identique.
   */
  ERRORS: {
    FAILED: 'L’action groupée a échoué',
    USER_NOT_FOUND:
      'Ce commercial n’est plus membre actif du projet. Rechargez la liste et choisissez-en un autre.',
    CAMPAIGN_NOT_FOUND:
      'Cette campagne n’existe plus. Rechargez la liste et choisissez-en une autre.',
  },
} as const;
