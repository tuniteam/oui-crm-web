import api from '@/config/axiosInstance';
import { ROLE_ROUTES } from '../constants/roles.constants';
import type {
  DuplicateRolePayload,
  DuplicateRoleResponse,
  PermissionsListResponse,
  Role,
  RolesListResponse,
  UpdateRolePayload,
} from '../types/role';

/**
 * Les rôles d'un projet. **Toutes ces routes sont scopées projet** :
 * l'en-tête `x-project-id` est posé par l'intercepteur, jamais dans l'URL.
 *
 * Aucune écriture n'est enveloppée dans un `Error` nu : l'écran doit
 * reconnaître `409 ROLE_CODE_EXISTS` pour le poser sous le champ Code,
 * `409 ROLE_IN_USE` pour nommer le nombre de porteurs, et `403 ROLE_IS_SYSTEM`
 * pour recharger une liste devenue fausse.
 */
export const roleService = {
  getAll: async (): Promise<RolesListResponse> =>
    (await api.get<RolesListResponse>(ROLE_ROUTES.ROLES_API)).data,

  /** Le catalogue complet des droits — jamais de décompte en dur à l'écran. */
  getPermissions: async (): Promise<PermissionsListResponse> =>
    (await api.get<PermissionsListResponse>(ROLE_ROUTES.PERMISSIONS_API)).data,

  /**
   * Duplique un rôle, système ou non : il n'existe pas de création à partir
   * de rien. Le nouveau rôle hérite des droits de sa source.
   */
  duplicate: async (
    id: string,
    payload: DuplicateRolePayload,
  ): Promise<DuplicateRoleResponse> =>
    (
      await api.post<DuplicateRoleResponse>(
        ROLE_ROUTES.DUPLICATE_API(id),
        payload,
      )
    ).data,

  /** `permissions` remplace **tout** l'ensemble des droits du rôle. */
  update: async (id: string, payload: UpdateRolePayload): Promise<Role> =>
    (await api.patch<Role>(ROLE_ROUTES.ROLE_API(id), payload)).data,

  remove: async (id: string): Promise<void> => {
    await api.delete(ROLE_ROUTES.ROLE_API(id));
  },
};
