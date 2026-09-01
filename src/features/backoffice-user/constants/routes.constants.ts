/** Routes plateforme : elles ne prennent PAS l'en-tete x-project-id. */
export const BACKOFFICE_USERS_API = '/backoffice/users';
export const BACKOFFICE_ROLES_API = '/backoffice/roles';

export const BACKOFFICE_USER_ROUTES = {
  LIST: '/backoffice-users',
  DETAIL: (userId: string) => `/backoffice-users/${userId}/informations`,
  RESEND_ACTIVATION_API: (userId: string) =>
    `${BACKOFFICE_USERS_API}/${userId}/resend-activation`,
  BY_ID_API: (userId: string) => `${BACKOFFICE_USERS_API}/${userId}`,
} as const;
