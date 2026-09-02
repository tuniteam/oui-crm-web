export const ORGANIZATION_ROUTES = {
  /** Route scopee projet : l'en-tete `x-project-id` porte le projet. */
  ORGANIZATIONS_API: '/organizations',
  ORGANIZATION_API: (id: string) => `/organizations/${id}`,
  ORGANIZATION_CONTACTS_API: (id: string) => `/organizations/${id}/contacts`,
  SEARCH_REGISTRY_API: '/organizations/search-registry',
} as const;
