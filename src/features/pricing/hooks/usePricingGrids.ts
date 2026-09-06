import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { PRICING_UI } from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';
import type { PricingGrid, PricingGridListResponse } from '../types/pricingGrid';

/** Les versions du projet — L2 · US-02-01. Tri decroissant, `content` absent. */
export function usePricingGrids(params: { page?: number; limit?: number }) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<PricingGridListResponse>({
    queryKey: ['pricing', 'list', projectId, params],
    queryFn: () => pricingService.getAll(params),
  });

  useEffect(() => {
    if (query.isError) toast.error(PRICING_UI.ERRORS.FETCH);
  }, [query.isError]);

  return {
    grids: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
  };
}

/**
 * Une version precise, `content` compris.
 *
 * Charge a la demande : la liste ne porte pas le contenu, on l'ouvre quand on
 * choisit une ligne. Le resultat est mis en cache par version — relire une
 * archive deja consultee ne rappelle pas le serveur.
 */
export function usePricingGrid(id: string | null) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<PricingGrid>({
    queryKey: ['pricing', 'detail', projectId, id],
    queryFn: () => pricingService.getOne(id as string),
    enabled: !!id,
  });

  return { grid: query.data ?? null, loading: query.isLoading };
}
