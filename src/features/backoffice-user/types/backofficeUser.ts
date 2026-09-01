import type { PaginationMeta } from '@/features/user/types/userList';

/**
 * Statut composite : etat du compte (PENDING/ACTIVE/INACTIVE) ou acces
 * backoffice suspendu (SUSPENDED). Meme valeur pour le filtre.
 */
export const BACKOFFICE_USER_STATUS_VALUES = [
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
] as const;

export type BackofficeUserStatus =
  (typeof BACKOFFICE_USER_STATUS_VALUES)[number];

export const BACKOFFICE_USER_STATUS = {
  PENDING: BACKOFFICE_USER_STATUS_VALUES[0],
  ACTIVE: BACKOFFICE_USER_STATUS_VALUES[1],
  INACTIVE: BACKOFFICE_USER_STATUS_VALUES[2],
  SUSPENDED: BACKOFFICE_USER_STATUS_VALUES[3],
} as const;

/** GET /backoffice/roles — liste de choix du formulaire. */
export type BackofficeRole = {
  code: string;
  label: string;
};

export type BackofficeRolesResponse = {
  data: BackofficeRole[];
};

/** Reponse a plat : pas de `relationShip`, le role est sur l'element. */
export type BackofficeUserListItem = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: BackofficeUserStatus;
  roleCode: string;
  roleLabel: string;
  lastLoginAt: string | null;
  createdAt: string;
};

export type BackofficeUserListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BackofficeUserStatus;
};

export type BackofficeUserListResponse = {
  data: BackofficeUserListItem[];
  meta: PaginationMeta;
};

/** GET /backoffice/users/:id — meme forme que l'element de liste. */
export type BackofficeUserDetails = BackofficeUserListItem;

export type CreateBackofficeUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  roleCode: string;
};

export type CreateBackofficeUserResponse = {
  id: string;
  status: BackofficeUserStatus;
};

export type UpdateBackofficeUserPayload = {
  firstName?: string;
  lastName?: string;
  roleCode?: string;
};

export type { PaginationMeta };
