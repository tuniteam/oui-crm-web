import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import { BOARD_ERRORS, BOARD_UI } from '../constants/board.constants';
import { SALES_STATUS_LABELS } from '../constants/organizationList.constants';
import { boardService } from '../services/board.service';
import type { SalesStatusPayload } from '../types/board';
import type { SalesStatus } from '../types/organizationList';

/**
 * Déplacer une fiche d'un statut commercial à l'autre — L1 · US-01-10.
 *
 * `sales-status` est le **seul chemin manuel** : `PATCH /organizations/:id`
 * refuse `salesStatus`. La route et les automatismes d'actions écrivent par la
 * même fonction côté serveur, et le journal distingue leur déclencheur.
 */
export function useSalesStatus() {
  const queryClient = useQueryClient();

  /*
   * Un statut commercial se lit sur le tableau, dans la liste des organismes,
   * sur la fiche, et l'agenda en dépend indirectement par ses actions. Ne
   * rafraîchir que le tableau laisserait les autres écrans mentir.
   */
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['organization'], exact: false });
  }, [queryClient]);

  const mutation = useMutation<
    { id: string; salesStatus: SalesStatus },
    unknown,
    { id: string; payload: SalesStatusPayload }
  >({
    mutationFn: ({ id, payload }) => boardService.setSalesStatus(id, payload),
  });

  return {
    moving: mutation.isPending,

    /**
     * Rend `true` quand le serveur a accepté.
     *
     * Le seul mouvement refusé est le dépôt sur la colonne actuelle
     * (`409`) — l'écran a divergé de l'état réel, on le dit et on recharge
     * plutôt que de laisser la carte à un endroit qu'elle n'occupe pas.
     */
    move: async (
      id: string,
      salesStatus: SalesStatus,
      reason?: string,
    ): Promise<boolean> => {
      try {
        await mutation.mutateAsync({
          id,
          payload: { salesStatus, ...(reason?.trim() ? { reason: reason.trim() } : {}) },
        });
        toast.success(BOARD_UI.MOVED(SALES_STATUS_LABELS[salesStatus]));
        invalidate();
        return true;
      } catch (err) {
        if (getApiErrorCode(err) === BOARD_ERRORS.INVALID_TRANSITION) {
          toast.error(BOARD_UI.ERRORS.INVALID_TRANSITION);
          invalidate();
          return false;
        }
        toast.error(getApiErrorMessage(err));
        return false;
      }
    },
  };
}
