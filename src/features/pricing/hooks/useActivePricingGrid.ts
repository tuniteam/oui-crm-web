import { useQuery } from '@tanstack/react-query';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { useMeStore } from '@/contexts/useMeStore';
import { PRICING_NO_ACTIVE } from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';
import type { PricingGrid } from '../types/pricingGrid';

/**
 * La grille tarifaire active du projet — L2 · US-02-01.
 *
 * Lue par `pricing:read`, que **les commerciaux ont** : c'est elle qui donne
 * les strates du filtre de la liste, et le configurateur en dependra.
 *
 * Un projet sans grille rend `404 PRICING_GRID_NO_ACTIVE`. Ce n'est pas une
 * erreur a signaler : on rend une grille absente, et ce qui en depend
 * disparait. On ne reessaie pas non plus — la reponse ne changera pas tant
 * qu'une version n'aura pas ete activee.
 */
export function useActivePricingGrid(enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<PricingGrid | null>({
    queryKey: ['pricing', 'active', projectId],
    queryFn: async () => {
      try {
        return await pricingService.getActive();
      } catch (err) {
        if (getApiErrorCode(err) === PRICING_NO_ACTIVE) return null;
        throw err;
      }
    },
    enabled,
    /* Les strates ne bougent qu'a l'activation d'une version : inutile de les
       redemander a chaque montage d'ecran. */
    staleTime: 5 * 60 * 1000,
  });

  return {
    grid: query.data ?? null,
    brackets: query.data?.content.brackets ?? [],
    loading: query.isLoading,
  };
}
