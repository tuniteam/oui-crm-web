export type ContactType = 'BACKOFFICE' | 'CLIENT';

export type ProfileRoleRelationship = {
  roleCode: string;
  roleLabel: string;
  clientName: string | null;
};

export type MyProfileResponse = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: string;
  avatarUrl: string | null;
  updatedAt: string;
  contactType: ContactType;
  roleRelationships: ProfileRoleRelationship[];
};