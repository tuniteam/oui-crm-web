import type { RelationshipStatus, UserStatus } from './userList';

export type UserRelationship = {
  id: string;
  roleCode: string;
  roleLabel: string;
  status: RelationshipStatus;
};

export type UserDetailsResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;

  relationShip: UserRelationship;

  contactType: 'BACKOFFICE' | 'CLIENT';
  lastLoginAt?: string;
  failedLoginAttempts?: number;

  createdAt: string;
  updatedAt: string;
};
