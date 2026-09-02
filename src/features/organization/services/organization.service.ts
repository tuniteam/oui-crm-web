import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { ORGANIZATION_ROUTES } from '../constants/organization.routes';
import type {
  OrganizationListParams,
  OrganizationListResponse,
} from '../types/organizationList';

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
};
