import api from '@/config/axiosInstance';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { CAMPAIGN_ROUTES } from '../constants/campaign.constants';
import type {
  Campaign,
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

  setStatus: async (id: string, status: CampaignStatus): Promise<Campaign> => {
    const res = await api.post<Campaign>(
      CAMPAIGN_ROUTES.CAMPAIGN_STATUS_API(id),
      { status },
    );
    return res.data;
  },
};
