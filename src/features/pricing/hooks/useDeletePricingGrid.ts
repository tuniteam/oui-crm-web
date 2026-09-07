import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import {
  PRICING_GRID_ACTIVE,
  PRICING_HAS_QUOTES,
  PRICING_UI,
} from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';

/**
 * Renoncer à une version — L2 · US-02-01, tranche C.
 *
 * Deux refus, et ils ne se disent pas pareil : la version **active** ne part
 * pas — le projet se retrouverait sans grille — et **tout** devis attaché
 * bloque, brouillon compris. C'est l'asymétrie voulue avec la correction :
 * corriger répare les brouillons, supprimer les détruirait, la relation
 * devis→grille étant en cascade.
 */
export function useDeletePricingGrid() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, unknown, { id: string; version: number }>({
    mutationFn: ({ id }) => pricingService.remove(id),

    onSuccess: (_data, { version }) => {
      toast.success(PRICING_UI.DELETE_WINDOW.DONE(version));
      queryClient.invalidateQueries({ queryKey: ['pricing'], exact: false });
    },

    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === PRICING_GRID_ACTIVE) {
        toast.error(PRICING_UI.ERRORS.ACTIVE_GRID);
        return;
      }
      if (code === PRICING_HAS_QUOTES) {
        const n = Number(getApiErrorMeta(err)?.quotes ?? 0);
        toast.error(PRICING_UI.ERRORS.DELETE_HAS_QUOTES(n));
        return;
      }
      toast.error(getApiErrorMessage(err) || PRICING_UI.ERRORS.SAVE);
    },
  });

  return {
    deleting: mutation.isPending,
    remove: async (payload: { id: string; version: number }): Promise<boolean> => {
      try {
        await mutation.mutateAsync(payload);
        return true;
      } catch {
        return false;
      }
    },
  };
}
