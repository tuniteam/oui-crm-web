export type ContactType = 'BACKOFFICE' | 'CLIENT';

/** Portee d'une permission : tout le perimetre, le projet, ou ses seules donnees. */
export const PERMISSION_SCOPE_VALUES = ['ALL', 'PROJECT', 'OWN'] as const;
export type PermissionScope = (typeof PERMISSION_SCOPE_VALUES)[number];

export const PERMISSION_SCOPE = {
  ALL: PERMISSION_SCOPE_VALUES[0],
  PROJECT: PERMISSION_SCOPE_VALUES[1],
  OWN: PERMISSION_SCOPE_VALUES[2],
} as const;

/** Origine d'une permission : heritee du role, ou surcharge individuelle. */
export const PERMISSION_SOURCE_VALUES = ['ROLE', 'OVERRIDE'] as const;
export type PermissionSource = (typeof PERMISSION_SOURCE_VALUES)[number];

/**
 * Permission effective sur un projet. L'API livre la liste deja resolue :
 * les surcharges sont appliquees, il n'y a rien a recalculer cote front.
 */
export type MePermission = {
  code: string;
  scope: PermissionScope;
  source: PermissionSource;
};

/** Perimetre geographique d'une relation. */
export type MeScope = {
  name: string;
  regions: string[];
  departments: string[];
  portfolioOnly: boolean;
};

/**
 * Rattachement d'un contact a un projet, avec ses droits sur ce projet.
 *
 * Le `projectId` porte le multi-tenant : il joue ici le role du `clientId` de
 * soft-m, mais ne transite jamais par l'URL — il part dans l'en-tete
 * `x-project-id`.
 */
export type MeRoleRelationship = {
  roleCode: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  /** Ordre d'affichage du selecteur de projet ; croissant. */
  displayOrder: number;
  outOfScopeAccess: boolean;
  permissions: MePermission[];
  /** Features activees du projet. Vide pour une relation backoffice. */
  modules: string[];
  scope: MeScope | null;
  /** Fin d'affectation, "YYYY-MM-DD", ou null si permanente. */
  expiresAt: string | null;
};

export type MeResponse = {
  contactId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  initials: string;
  avatarUrl: string | null;
  contactType: ContactType;
  roleRelationships: MeRoleRelationship[];
  legalReacceptanceRequired: boolean;
  legalDocumentsToAccept: string[];
};
