/**
 * Codes de permission
 *
 * Source de vérité unique : une faute de frappe dans un littéral
 * (`'users:delte'`) échouerait silencieusement côté `hasPermission`.
 */
export const PERMISSIONS = {
  DASHBOARD: { READ: 'dashboard:read' },
  STATS: { READ: 'stats:read' },
  ACTIVITIES: {
    READ: 'activities:read',
    CREATE: 'activities:create',
    UPDATE: 'activities:update',
    /** Le commercial ne l'a pas : seuls l'admin et le directeur suppriment. */
    DELETE: 'activities:delete',
  },
  /** Codes releves sur GET /permissions du projet, pas devines. */
  ORGANIZATIONS: {
    READ: 'organizations:read',
    CREATE: 'organizations:create',
    UPDATE: 'organizations:update',
    DELETE: 'organizations:delete',
    /** Actions groupees (US-01-05), import et export (US-01-06/07). */
    BULK: 'organizations:bulk',
    IMPORT: 'organizations:import',
    EXPORT: 'organizations:export',
  },
  CONTACTS: {
    READ: 'contacts:read',
    CREATE: 'contacts:create',
    UPDATE: 'contacts:update',
    DELETE: 'contacts:delete',
  },
  CAMPAIGNS: {
    READ: 'campaigns:read',
    CREATE: 'campaigns:create',
    UPDATE: 'campaigns:update',
    /** Le commercial ne l'a pas ; le formateur n'a rien du tout. */
    DELETE: 'campaigns:delete',
  },
  OPPORTUNITIES: { READ: 'opportunities:read' },
  QUOTES: { READ: 'quotes:read' },
  CONTRACTS: { READ: 'contracts:read' },
  INVOICES: { READ: 'invoices:read' },
  DEPLOYMENTS: { READ: 'deployments:read' },
  TRAININGS: { READ: 'trainings:read' },
  TICKETS: { READ: 'tickets:read' },
  ROLES: { READ: 'roles:read' },
  /** Le contrat n'a pas de permission de creation distincte : `update` couvre
   *  la creation, la modification et la suppression. */
  SCOPES: { READ: 'scopes:read', UPDATE: 'scopes:update' },
  REFERENCES: { READ: 'references:read', UPDATE: 'references:update' },
  SETTINGS: { READ: 'settings:read', UPDATE: 'settings:update' },
  PRICING: { READ: 'pricing:read', UPDATE: 'pricing:update' },
  AUDIT_LOG: { READ: 'auditLog:read' },
  /** Comptes back-office — routes plateforme, sans projet. */
  USER_BACKOFFICE: {
    READ: 'userBackoffice:read',
    CREATE: 'userBackoffice:create',
    UPDATE: 'userBackoffice:update',
    DELETE: 'userBackoffice:delete',
  },
  PROJECTS: {
    READ: 'projects:read',
    CREATE: 'projects:create',
    UPDATE: 'projects:update',
  },
  USERS: {
    READ: 'users:read',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
} as const;
