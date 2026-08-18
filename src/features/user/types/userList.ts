import { USER_STATUS_VALUES } from '../constants/userList.constants';

export type RelationshipStatus = 'ACTIVE' | 'SUSPENDED';
export type UserStatus = (typeof USER_STATUS_VALUES)[number];
export type UserRelationshipLite = {
  roleCode: string;
  roleLabel: string;
  status: RelationshipStatus;
};

export type UserListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  relationShip: UserRelationshipLite;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserListResponse = {
  data: UserListItem[];
  meta: PaginationMeta;
};

export type UserListParams = {
  page?: number;
  limit?: number;
  status?: UserStatus;
  search?: string;
};
