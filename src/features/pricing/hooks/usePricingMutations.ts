import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApiErrorDetails,
  getApiErrorMessage,
} from '@/shared/utils/api-error';
import { PRICING_UI } from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';
import type { PricingGridContent } from '../types/pricingGrid';

/**
 * Preparer une version — L2 · US-02-01, tranche B.
 *
 * **`fromVersion` accompagne toujours le `content`.** Il porte deux roles : d'ou
 * le contenu est copie, **et** de quelle version la nouvelle derive. Omis,
 * `basedOnVersion` vaut `null` et le garde-fou d'activation du serveur ne se
 * declenche jamais — la protection existerait sans proteger. Le serveur ne peut
 * pas le deviner : il ne recoit qu'un contenu.
 */
export function useCreatePricingGrid() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { id: string; version: number },
    unknown,
    { fromVersion: number; content: PricingGridContent; effectiveDate: string }
  >({
    mutationFn: (payload) => pricingService.create(payload),

    onSuccess: ({ version }) => {
      toast.success(PRICING_UI.SAVE_WINDOW.SAVED(version));
      /* La liste doit montrer la nouvelle version. La grille **active** ne
         bouge pas : une version nait inactive, et rien de ce qui en depend —
         strates d'une fiche, filtre de la liste — n'a change. */
      queryClient.invalidateQueries({ queryKey: ['pricing', 'list'], exact: false });
    },

    onError: (err) => {
      /* `details[]` porte le chemin fautif — « subscription.CONFORT: 5 prices
         for 6 brackets ». Les rendre tels quels vaut mieux qu'un message
         generique ; leur resolution en cellules releve de la tranche C. */
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
    create: async (payload: {
      fromVersion: number;
      content: PricingGridContent;
      effectiveDate: string;
    }) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch {
        return null;
      }
    },
  };
}
