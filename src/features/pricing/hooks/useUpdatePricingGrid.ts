import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApiErrorCode,
  getApiErrorDetails,
  getApiErrorMessage,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import {
  PRICING_HAS_QUOTES,
  PRICING_UI,
} from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';
import type { PricingGrid, PricingGridContent } from '../types/pricingGrid';

/**
 * Corriger une version sur place — SPEC-18, 07/09/2026.
 *
 * Remplace la creation d'une version tant qu'aucun devis **emis** n'est
 * attache. Le front ne decide pas : `quotesCount` melange brouillons et devis
 * emis, et les brouillons ne bloquent pas — ils sont recalcules. On tente, et
 * on lit `409 PRICING_GRID_HAS_QUOTES`.
 */
export function useUpdatePricingGrid() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    PricingGrid,
    unknown,
    { id: string; content?: PricingGridContent; effectiveDate?: string }
  >({
    mutationFn: ({ id, ...payload }) => pricingService.update(id, payload),

    onSuccess: (grid) => {
      toast.success(PRICING_UI.EDIT.FIXED(grid.version));
      queryClient.invalidateQueries({ queryKey: ['pricing'], exact: false });
      /* Corriger la grille **active** change `bracketLabel` des fiches : la
         liste des organismes et les fiches ouvertes doivent recharger. */
      if (grid.active) {
        queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
        queryClient.invalidateQueries({ queryKey: ['organization'], exact: false });
      }
    },

    onError: (err) => {
      if (getApiErrorCode(err) === PRICING_HAS_QUOTES) {
        const n = Number(getApiErrorMeta(err)?.quotes ?? 0);
        toast.error(PRICING_UI.EDIT.HAS_QUOTES(n));
        return;
      }
      const details = getApiErrorDetails(err);
      toast.error(
        details?.length
          ? PRICING_UI.ERRORS.INVALID + details.join(' · ')
          : getApiErrorMessage(err) || PRICING_UI.ERRORS.SAVE,
      );
    },
  });

  return {
    saving: mutation.isPending,
    /** Rend le code d'erreur quand il y en a un : l'ecran propose alors une
     *  nouvelle version plutot que de laisser l'utilisateur sans issue. */
    update: async (payload: {
      id: string;
      content?: PricingGridContent;
      effectiveDate?: string;
    }): Promise<{ ok: boolean; code: string | null }> => {
      try {
        await mutation.mutateAsync(payload);
        return { ok: true, code: null };
      } catch (err) {
        return { ok: false, code: getApiErrorCode(err) };
      }
    },
  };
}
