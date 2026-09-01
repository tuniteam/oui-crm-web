import { STAGE_VALUES, type Stage } from '../types/settings';

/** Onglets de l'ecran Parametres, repris de la maquette V8. */
export const SETTINGS_TABS = {
  COMPANY: 'company',
  BUSINESS_RULES: 'business-rules',
  DOCUMENTS: 'documents',
  REFERENCES: 'references',
} as const;

export type SettingsTab = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

export const SETTINGS_UI = {
  TITLE: 'Paramètres',
  SUBTITLE: 'Réglages du projet : société, règles commerciales, documents et référentiels.',
  /** Nom du paramètre d'URL qui porte le panneau ouvert. */
  TAB_PARAM: 'panneau',

  /** Une ligne par panneau : ce qu'on y règle, pour choisir sans ouvrir. */
  DESCRIPTIONS: {
    COMPANY: 'Identité utilisée sur les devis et contrats',
    BUSINESS_RULES: 'TVA, objectifs, validité, remises, probabilités',
    DOCUMENTS: 'Gabarits, cachet et formats de numérotation',
    REFERENCES: 'Valeurs des listes déroulantes de l’application',
  },

  ITEMS: {
    COMPANY: 'Société',
    BUSINESS_RULES: 'Règles commerciales',
    DOCUMENTS: 'Documents et numérotation',
    REFERENCES: 'Référentiels',
  },
} as const;

export const COMPANY_UI = {
  TITLE: "Identité de l'entreprise",
  DESCRIPTION:
    'Ces informations alimentent l’en-tête des devis et des contrats générés.',
  FIELDS: {
    NAME: 'Raison sociale',
    SIREN: 'SIREN',
    SIRET: 'SIRET',
    RCS: 'RCS',
    ADDRESS: 'Adresse',
    PHONE: 'Téléphone',
    EMAIL: 'Email',
    SIGNATORY: 'Signataire',
  },
} as const;

export const BUSINESS_RULES_UI = {
  TITLE: 'Objectifs et règles',
  DESCRIPTION:
    'Ces valeurs pilotent les calculs des devis, des contrats et des statistiques.',
  FIELDS: {
    VAT_RATE: 'Taux de TVA (%)',
    REVENUE_TARGET: 'Objectif de chiffre d’affaires annuel (€)',
    MEETING_TARGET: 'Objectif de rendez-vous',
    QUOTE_VALIDITY_DAYS: 'Validité des devis (jours)',
    NOTICE_MONTHS: 'Préavis de résiliation (mois)',
    DEFAULT_COMMITMENT_MONTHS: 'Engagement par défaut (mois)',
    DISCOUNT_CAP: 'Plafond de remise (%)',
    RETENTION_MONTHS: 'Conservation des données (mois)',
  },
  PROBABILITIES: {
    TITLE: 'Probabilités par étape',
    DESCRIPTION:
      'Probabilité de signature associée à chaque étape d’une opportunité.',
    FIXED_HINT: 'Valeur figée par le serveur.',
  },
} as const;

/** Libelles des etapes, dans l'ordre du contrat. */
export const STAGE_LABELS: Record<Stage, string> = {
  QUALIFICATION: 'Qualification',
  DEMONSTRATION: 'Démonstration',
  QUOTE_SENT: 'Devis envoyé',
  NEGOTIATING: 'Négociation',
  VERBAL_AGREEMENT: 'Accord oral',
  WON: 'Gagnée',
  LOST: 'Perdue',
};

export const STAGE_ORDER = STAGE_VALUES;

export const DOCUMENTS_UI = {
  NUMBERING: {
    TITLE: 'Numérotation',
    DESCRIPTION:
      'Format en service : année, quantième du jour, initiales du commercial, séquence du jour.',
    QUOTE: 'Devis',
    CONTRACT: 'Contrat',
    INVOICE: 'Facture',
    NOTE: 'La séquence des factures repart à 1 au 1er janvier. Celle des devis repart à 1 chaque jour.',
    READ_ONLY: 'Exemples calculés par le serveur : ces formats ne se saisissent pas.',
  },

  TEMPLATES: {
    TITLE: 'Gabarits',
    DESCRIPTION:
      'Un gabarit HTML par type de document. Le dernier téléversé devient le gabarit actif.',
    QUOTE: 'Devis',
    CONTRACT: "Contrat d'abonnement",
    NONE: 'Aucun gabarit téléversé',
    VERSION: (n: number) => `Version ${n}`,
    UPLOADED_AT: (date: string) => `Téléversé le ${date}`,
    DOWNLOAD: 'Télécharger',
    REPLACE: 'Remplacer',
    UPLOAD: 'Téléverser',
    ACCEPT: '.html',
    MAX_SIZE_HINT: 'Fichier HTML, 1 Mo maximum.',
    INVALID_TITLE: 'Gabarit refusé',
    INVALID_HINT:
      'Corrigez le fichier puis téléversez-le à nouveau. Détail renvoyé par le serveur :',
  },

  SIGNATURE: {
    TITLE: 'Cachet et signature',
    DESCRIPTION:
      "Image apposée sur les devis et contrats générés. Une seule par projet : un nouveau dépôt remplace l'ancienne.",
    NONE: 'Aucun cachet déposé',
    UPLOAD: 'Déposer une image',
    REPLACE: 'Remplacer',
    ACCEPT: 'image/png,image/jpeg',
    MAX_SIZE_HINT: 'PNG ou JPEG, 2 Mo maximum.',
  },

  TOASTS: {
    TEMPLATE_UPLOADED: 'Gabarit mis à jour.',
    SIGNATURE_UPLOADED: 'Cachet mis à jour.',
  },
} as const;

export const SETTINGS_ACTIONS = {
  SAVE: 'Enregistrer',
  SAVING: 'Enregistrement...',
} as const;

export const SETTINGS_ERRORS = {
  FETCH: 'Impossible de charger les paramètres.',
} as const;

export const SETTINGS_TOASTS = {
  SAVED: 'Paramètres enregistrés.',
} as const;

export const SETTINGS_ZOD = {
  REQUIRED: 'Champ requis',
  INVALID_EMAIL: 'Adresse email invalide',
  SIREN: 'Le SIREN doit comporter 9 chiffres',
  SIRET: 'Le SIRET doit comporter 14 chiffres',
  MAX_150: 'Maximum 150 caractères',
  RANGE_0_100: 'Valeur entre 0 et 100',
  INTEGER_POSITIVE: 'Nombre entier positif',
  MIN_1: 'Minimum 1',
} as const;
