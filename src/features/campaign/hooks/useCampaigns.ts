import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { CAMPAIGNS_UI } from '../constants/campaign.constants';
import { campaignService } from '../services/campaign.service';
import type { CampaignListParams, CampaignListResponse } from '../types/campaign';

/** Campagnes du projet — L1 · US-01-11. */
export function useCampaigns(params: CampaignListParams) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<CampaignListResponse>({
    queryKey: ['campaigns', 'list', projectId, params],
    queryFn: () => campaignService.getAll(params),
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : CAMPAIGNS_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    campaigns: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
  };
}
