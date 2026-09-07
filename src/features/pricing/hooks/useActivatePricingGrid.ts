import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getApiErrorCode,
  getApiErrorDetails,
  getApiErrorMessage,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import {
  PRICING_BASE_OUTDATED,
  PRICING_UI,
} from '../constants/pricing.constants';
import { pricingService } from '../services/pricing.service';
import type { PricingGrid } from '../types/pricingGrid';

/**
 * Activer une version — L2 · US-02-01, tranche C.
 *
 * C'est **le seul geste qui change les prix en vigueur** : préparer n'applique
 * rien, aucun automatisme ne bascule à la date d'effet. La bascule se fait
 * dans une transaction côté serveur, il n'existe donc pas d'instant sans
 * grille.
 *
 * Le refus d'une version dérivée d'une grille périmée
 * (`409 PRICING_GRID_BASE_OUTDATED`) remonte à l'appelant plutôt que de finir
 * en toast : l'écran propose alors de forcer, ce qui est légitime quand on
 * revient volontairement à une grille antérieure.
 */
export function useActivatePricingGrid() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    PricingGrid,
    unknown,
    { id: string; effectiveDate?: string; force?: boolean }
  >({
    mutationFn: ({ id, ...payload }) => pricingService.activate(id, payload),

    onSuccess: (grid) => {
      toast.success(PRICING_UI.ACTIVATE_WINDOW.DONE(grid.version));
      queryClient.invalidateQueries({ queryKey: ['pricing'], exact: false });
      /* `bracketLabel` est calculée depuis la grille active : la liste des
         organismes et les fiches ouvertes affichent une strate périmée tant
         qu'elles ne rechargent pas. */
      queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['organization'], exact: false });
    },

    onError: (err) => {
      /* Traité par l'écran, qui propose de forcer : un toast rouge ici
         ajouterait du bruit à une question qu'on est en train de poser. */
      if (getApiErrorCode(err) === PRICING_BASE_OUTDATED) return;
      const details = getApiErrorDetails(err);
      toast.error(
        details?.length
          ? PRICING_UI.ERRORS.INVALID + details.join(' · ')
          : getApiErrorMessage(err) || PRICING_UI.ERRORS.SAVE,
      );
    },
  });

  return {
    activating: mutation.isPending,
    /**
     * Rend le code et, pour `BASE_OUTDATED`, les deux numéros : de quoi écrire
     * « préparée à partir de la v1, alors que la v5 est active » sans analyser
     * une phrase.
     */
    activate: async (payload: {
      id: string;
      effectiveDate?: string;
      force?: boolean;
    }): Promise<{
      ok: boolean;
      code: string | null;
      activeVersion: number | null;
      basedOnVersion: number | null;
    }> => {
      try {
        await mutation.mutateAsync(payload);
        return { ok: true, code: null, activeVersion: null, basedOnVersion: null };
      } catch (err) {
        const meta = getApiErrorMeta(err);
        const num = (v: unknown) => (typeof v === 'number' ? v : null);
        return {
          ok: false,
          code: getApiErrorCode(err),
          activeVersion: num(meta?.activeVersion),
          basedOnVersion: num(meta?.basedOnVersion),
        };
      }
    },
  };
}
