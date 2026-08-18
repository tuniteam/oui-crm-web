// src/features/users/types/updateUser.ts
import type { UserStatus } from './userList';

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  status?: UserStatus;
  roleId?: string;
};

export type UpdateUserResponse = {
  id: string;
  email: string;
};
