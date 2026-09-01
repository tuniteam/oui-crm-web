import type { UserListItem } from './userList';

/** Permission effective : issue du role ou d'un override d'affectation. */
export type EffectivePermission = {
  code: string;
  scope: 'PROJECT' | 'OWN';
  source: 'ROLE' | 'OVERRIDE';
};

/**
 * GET /users/:id : la ligne de liste, plus le telephone et les permissions
 * effectives. Le serveur ne rend ni `createdAt`/`updatedAt`, ni les compteurs
 * de connexions echouees.
 */
export type UserDetailsResponse = UserListItem & {
  phone: string | null;
  permissions: EffectivePermission[];
};
