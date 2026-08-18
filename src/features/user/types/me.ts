export type ContactType = 'BACKOFFICE' | 'CLIENT';

export type MeRoleRelationship = {
  roleCode: string;
  permissions: string[];
 
};

export type MeResponse = {
  email: string;
  contactId: string;
  contactType: ContactType;
  roleRelationships: MeRoleRelationship[];
};
