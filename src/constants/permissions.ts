/**
 * Codes de permission
 *
 * Source de vérité unique : une faute de frappe dans un littéral
 * (`'users:delte'`) échouerait silencieusement côté `hasPermission`.
 */
export const PERMISSIONS = {
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
