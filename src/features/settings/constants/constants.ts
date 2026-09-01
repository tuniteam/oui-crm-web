import { STAGE_VALUES, type Stage } from '../types/settings';

/** Onglets de l'ecran Parametres, repris de la maquette V8. */
export const SETTINGS_TABS = {
  COMPANY: 'company',
  USERS: 'users',
  ROLES: 'roles',
  SCOPES: 'scopes',
  AUDIT_LOG: 'audit-log',
  BUSINESS_RULES: 'business-rules',
  PRICING: 'pricing',
  DOCUMENTS: 'documents',
  REFERENCES: 'references',
  DATA: 'data',
} as const;

export type SettingsTab = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

export const SETTINGS_UI = {
  TITLE: 'Paramètres',
  SUBTITLE: 'Organisation, sécurité et accès, règles métier et données.',

  GROUPS: {
    ORGANISATION: 'Organisation',
    SECURITY: 'Sécurité et accès',
    BUSINESS: 'Règles métier',
    DATA: 'Données',
  },

  ITEMS: {
    COMPANY: 'Société',
    USERS: 'Utilisateurs',
    ROLES: 'Rôles et droits',
    SCOPES: 'Périmètres',
    AUDIT_LOG: "Journal d'activité",
    BUSINESS_RULES: 'Règles commerciales',
    PRICING: 'Grille tarifaire',
    DOCUMENTS: 'Documents et numérotation',
    REFERENCES: 'Référentiels',
    DATA: 'Sauvegarde et conservation',
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
