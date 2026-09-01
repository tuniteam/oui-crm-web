/**
 * Labels de navigation
 */
export const MENU = {
  // Pour menu-client-manage.ts:14, :16, :21
  CONFIGURATION: 'Configuration',
 
  DASHBOARD: 'Tableau de bord',
  
  PROJECTS: 'Projets',
  BACKOFFICE_USERS: 'Opérateurs',
  USERS: 'Utilisateurs',

} as const;

/**
 * Libelles du menu affiche quand un projet est ouvert.
 * Repris tels quels de la maquette V8, groupes compris.
 */
export const MENU_PROJECT = {
  GROUPS: {
    STEERING: 'Pilotage',
    PROSPECTING: 'Prospection',
    SALES: 'Commercial',
    CUSTOMERS: 'Clients',
    ADMINISTRATION: 'Administration',
  },

  DASHBOARD: 'Tableau de bord',
  AGENDA: 'Agenda',
  STATS: 'Statistiques',

  ORGANIZATIONS: 'Organismes',
  CAMPAIGNS: 'Campagnes',
  PROSPECTING: 'Suivi prospection',

  OPPORTUNITIES: 'Opportunités',
  QUOTES: 'Devis',
  CONTRACTS: 'Contrats',
  INVOICES: 'Factures',

  PORTFOLIO: 'Portefeuille',
  DEPLOYMENTS: 'Déploiements',
  TRAININGS: 'Formations',
  SUPPORT: 'Support',
  RENEWALS: 'Renouvellements',

  USERS: 'Utilisateurs',
  ROLES: 'Rôles',
  SCOPES: 'Périmètres',
  REFERENCES: 'Référentiels',
  SETTINGS: 'Paramètres',
} as const;
