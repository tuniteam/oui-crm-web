import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { CAMPAIGN_RESULTS_UI } from '../constants/campaign.constants';
import { campaignService } from '../services/campaign.service';
import type { CampaignResultsResponse } from '../types/campaign';

/**
 * Le detail des resultats d'une campagne — L1 · US-01-11, tranche C.
 *
 * Calcule **a la demande**, jamais stocke : la reponse n'est donc pas mise en
 * cache longtemps, et l'ecran la recharge a chaque ouverture du panneau.
 */
export function useCampaignResults(campaignId: string | null, open: boolean) {
  const projectId = useMeStore((s) => s.activeProjectId);
  const [page, setPage] = useState(1);

  const query = useQuery<CampaignResultsResponse>({
    queryKey: ['campaigns', 'results', projectId, campaignId, page],
    queryFn: () => campaignService.getResults(campaignId as string, { page, limit: 20 }),
    enabled: open && !!campaignId,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : CAMPAIGN_RESULTS_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    /* Les totaux viennent du serveur et portent sur toute la campagne. Les
       recalculer depuis les lignes donnerait le total de la page courante. */
    totals: query.data?.totals ?? null,
    rows: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    page,
    setPage,
    loading: query.isLoading,
  };
}
