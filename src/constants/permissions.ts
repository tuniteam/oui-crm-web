/**
 * Codes de permission
 *
 * Source de vérité unique : une faute de frappe dans un littéral
 * (`'users:delte'`) échouerait silencieusement côté `hasPermission`.
 */
export const PERMISSIONS = {
  DASHBOARD: { READ: 'dashboard:read' },
  STATS: { READ: 'stats:read' },
  ACTIVITIES: { READ: 'activities:read' },
  ORGANIZATIONS: { READ: 'organizations:read' },
  CAMPAIGNS: { READ: 'campaigns:read' },
  OPPORTUNITIES: { READ: 'opportunities:read' },
  QUOTES: { READ: 'quotes:read' },
  CONTRACTS: { READ: 'contracts:read' },
  INVOICES: { READ: 'invoices:read' },
  DEPLOYMENTS: { READ: 'deployments:read' },
  TRAININGS: { READ: 'trainings:read' },
  TICKETS: { READ: 'tickets:read' },
  ROLES: { READ: 'roles:read' },
  SCOPES: { READ: 'scopes:read' },
  REFERENCES: { READ: 'references:read' },
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
