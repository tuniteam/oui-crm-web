export type ContactType = 'BACKOFFICE' | 'CLIENT';

/**
 * Rattachement d'un contact a un projet, avec ses droits sur ce projet.
 *
 * Le `projectId` porte le multi-tenant : il joue ici le role du `clientId` de
 * soft-m. Il est null pour un contact BACKOFFICE, qui n'est rattache a aucun
 * projet en particulier.
 *
 * TODO(spec) : le contenu exact de GET /me reste a specifier (perimetre,
 * modules). Les champs ci-dessous sont ceux dont le front a besoin aujourd'hui ;
 * a confronter au contrat definitif.
 */
export type MeRoleRelationship = {
  roleCode: string;
  projectId: string | null;
  projectName: string | null;
  /** Ordre d'affichage du selecteur de projet ; croissant. */
  displayOrder: number;
  permissions: string[];
  modules: string[];
};

export type MeResponse = {
  email: string;
  contactId: string;
  contactType: ContactType;
  roleRelationships: MeRoleRelationship[];
};
