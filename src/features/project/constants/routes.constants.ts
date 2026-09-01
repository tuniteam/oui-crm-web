export const PROJECT_ROUTES = {
  // UI
  PROJECTS: '/projects',
  PROJECT_DETAILS: (id: string) => `/projects/${id}/informations`,

  // API — routes plateforme : elles ne prennent pas l'en-tete x-project-id.
  PROJECTS_API: '/projects',
  PROJECT_API: (id: string) => `/projects/${id}`,
} as const;
