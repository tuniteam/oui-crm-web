import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import type { RoleListParams, RoleListResponse } from '../types/role';
import { ROLE_ROUTES } from '../constants/user.routes';

export const rolesService = {
  getAll: async (params?: RoleListParams): Promise<RoleListResponse> => {
    try {
      const res = await api.get<RoleListResponse>(ROLE_ROUTES.ROLES_API, { params });
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
