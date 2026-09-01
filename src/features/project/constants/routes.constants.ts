/** Routes API. Les routes projets sont au niveau plateforme : pas d'en-tete x-project-id. */
export const PROJECT_API_ROUTES = {
  PROJECTS: '/projects',
  PROJECT_BY_ID: (projectId: string) => `/projects/${projectId}`,
} as const;

/** Routes front. */
export const PROJECT_ROUTES = {
  PROJECTS_LIST: '/projects',
  PROJECT_DETAILS: (projectId: string) => `/projects/${projectId}`,
} as const;
