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
  USER_INVITE_API: (userId: string) => `/users/${userId}/invite`,
  
} as const;

export const ROLE_ROUTES = {
  ROLES_API: '/roles',
} as const;
