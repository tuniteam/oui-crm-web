import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { CAMPAIGN_ROUTES } from '../constants/campaign.constants';
import type { OrganizationListResponse } from '@/features/organization/types/organizationList';
import type {
  Campaign,
  CampaignResultsResponse,
  CampaignTargetReport,
  CampaignListParams,
  CampaignListResponse,
  CampaignStatus,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../types/campaign';

/**
 * Les ecritures ne sont **pas** enveloppees dans un `Error` nu : l'appelant a
 * besoin du code brut pour distinguer ce que le contrat distingue — un nom
 * deja pris, une transition refusee, une campagne citee par un perimetre.
 */
export const campaignService = {
  getAll: async (params: CampaignListParams): Promise<CampaignListResponse> => {
    try {
      const res = await api.get<CampaignListResponse>(
        CAMPAIGN_ROUTES.CAMPAIGNS_API,
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  create: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    const res = await api.post<Campaign>(
      CAMPAIGN_ROUTES.CAMPAIGNS_API,
      payload,
    );
    return res.data;
  },

  update: async (
    id: string,
    payload: UpdateCampaignPayload,
  ): Promise<Campaign> => {
    const res = await api.patch<Campaign>(
      CAMPAIGN_ROUTES.CAMPAIGN_API(id),
      payload,
    );
    return res.data;
  },

  /** La cible figee, paginee, triee par ajout decroissant. */
  getTarget: async (
    id: string,
    params: { page?: number; limit?: number },
  ): Promise<OrganizationListResponse> => {
    try {
      const res = await api.get<OrganizationListResponse>(
        CAMPAIGN_ROUTES.CAMPAIGN_ORGANIZATIONS_API(id),
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  addToTarget: async (
    id: string,
    ids: string[],
  ): Promise<CampaignTargetReport> => {
    const res = await api.post<CampaignTargetReport>(
      CAMPAIGN_ROUTES.CAMPAIGN_ORGANIZATIONS_API(id),
      { ids },
    );
    return res.data;
  },

  removeFromTarget: async (id: string, orgId: string): Promise<void> => {
    await api.delete(CAMPAIGN_ROUTES.CAMPAIGN_ORGANIZATION_API(id, orgId));
  },

  /** Detail par organisme cible, pagine et filtre par le perimetre. */
  getResults: async (
    id: string,
    params: { page?: number; limit?: number },
  ): Promise<CampaignResultsResponse> => {
    try {
      const res = await api.get<CampaignResultsResponse>(
        CAMPAIGN_ROUTES.CAMPAIGN_RESULTS_API(id),
        { params },
      );
      return res.data;
    } catch (err) {
      throw new Error(getApiErrorMessage(err));
    }
  },

  /** Non enveloppee : l'appelant lit `CAMPAIGN_IN_USE_BY_SCOPE` et son `meta`. */
  remove: async (id: string): Promise<void> => {
    await api.delete(CAMPAIGN_ROUTES.CAMPAIGN_API(id));
  },

  setStatus: async (id: string, status: CampaignStatus): Promise<Campaign> => {
    const res = await api.post<Campaign>(
      CAMPAIGN_ROUTES.CAMPAIGN_STATUS_API(id),
      { status },
    );
    return res.data;
  },
};
