export const ME_ROUTES = {
  ME_API: '/profile/me',
};

export const USER_ROUTES = {
  USERS_API: '/users',

  USERS_LIST: () => `/users`,

  USER_DETAILS: (userId: string) =>
    `/users/${userId}/informations`,
  
  USER_UPDATE_API: (userId: string) => `/users/${userId}`,
  USER_CORRECT_EMAIL_API: (userId: string) => `/users/${userId}/email`,

  /** Renvoi du lien d'activation (US-00-05). Il n'y a pas de route /invite. */
  USER_RESEND_ACTIVATION_API: (userId: string) =>
    `/users/${userId}/resend-activation`,
  
} as const;

export const ROLE_ROUTES = {
  ROLES_API: '/roles',
} as const;
