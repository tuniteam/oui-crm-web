/**
 * Codes de permission
 *
 * Source de vérité unique : une faute de frappe dans un littéral
 * (`'users:delte'`) échouerait silencieusement côté `hasPermission`.
 */
export const PERMISSIONS = {
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
