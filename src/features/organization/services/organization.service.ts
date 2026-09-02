import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { ORGANIZATION_ROUTES } from '../constants/organization.routes';
import type {
  OrganizationListParams,
  OrganizationListResponse,
} from '../types/organizationList';
import type {
  OrganizationDetail,
  UpdateOrganizationPayload,
} from '../types/organizationDetail';

export const organizationService = {
  getAll: async (
    params: OrganizationListParams,
  ): Promise<OrganizationListResponse> => {
    try {
      const res = await api.get<OrganizationListResponse>(
        ORGANIZATION_ROUTES.ORGANIZATIONS_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  getOne: async (id: string): Promise<OrganizationDetail> => {
    try {
      const res = await api.get<OrganizationDetail>(
        ORGANIZATION_ROUTES.ORGANIZATION_API(id),
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  update: async (
    id: string,
    payload: UpdateOrganizationPayload,
  ): Promise<OrganizationDetail> => {
    try {
      const res = await api.patch<OrganizationDetail>(
        ORGANIZATION_ROUTES.ORGANIZATION_API(id),
        payload,
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },
};
