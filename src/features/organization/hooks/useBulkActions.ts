import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import { BULK_UI } from '../constants/bulk.constants';
import { bulkService } from '../services/bulk.service';
import type { BulkAction, BulkRequest, BulkResult } from '../types/bulk';

/**
 * Ce que chaque action fait bouger ailleurs.
 *
 * `SET_SALES_STATUS` et `ADD_TO_CAMPAIGN` passent par l'**ecrivain unique** du
 * statut commercial, le meme que le tableau de prospection et que les
 * automatismes d'actions : le tableau doit se recharger, sinon il montrera des
 * colonnes fausses. `ADD_TO_CAMPAIGN` touche en plus le compteur de cible
 * d'une campagne.
 */
const TOUCHES: Record<BulkAction, string[]> = {
  ASSIGN_SALES_REP: ['organizations', 'organization'],
  SET_SALES_STATUS: ['organizations', 'organization'],
  SET_PRIORITY: ['organizations', 'organization'],
  ADD_TO_CAMPAIGN: ['organizations', 'organization', 'campaigns'],
  DELETE: ['organizations', 'organization'],
};

export function useBulkActions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    (action: BulkAction) => {
      for (const key of TOUCHES[action]) {
        queryClient.invalidateQueries({ queryKey: [key], exact: false });
      }
    },
    [queryClient],
  );

  const mutation = useMutation<BulkResult, unknown, BulkRequest>({
    mutationFn: (request) => bulkService.run(request),
  });

  return {
    running: mutation.isPending,

    /**
     * Rend le compte rendu, ou `null` si l'appel a echoue.
     *
     * L'appel **n'echoue jamais partiellement** : une selection dont la moitie
     * est hors perimetre rend `200` avec les fiches ignorees dans `skipped`.
     * Seuls un droit manquant ou une charge utile invalide echouent.
     */
    run: async (request: BulkRequest): Promise<BulkResult | null> => {
      try {
        const result = await mutation.mutateAsync(request);
        /*
         * Le compte rendu dit **pourquoi**. « 2 ignorees » sans motif laisse
         * chercher : une fiche hors perimetre et une fiche supprimee ne se
         * traitent pas de la meme facon.
         */
        const byReason = result.skipped.reduce<Record<string, number>>(
          (acc, s) => ({ ...acc, [s.reason]: (acc[s.reason] ?? 0) + 1 }),
          {},
        );
        const report = BULK_UI.REPORT(result.processed, result.skipped.length);
        toast.success(report, {
          description: result.skipped.length
            ? BULK_UI.SKIP_DETAIL(byReason)
            : undefined,
        });
        invalidate(request.action);
        return result;
      } catch (err) {
        /*
         * Le service rend l'erreur brute exprès : c'est ici qu'on distingue un
         * choix devenu caduc d'une panne. Le message du serveur reste le
         * dernier recours — il est humain, jamais analysé.
         */
        const code = getApiErrorCode(err);
        const known =
          code === 'USER_NOT_FOUND'
            ? BULK_UI.ERRORS.USER_NOT_FOUND
            : code === 'CAMPAIGN_NOT_FOUND'
              ? BULK_UI.ERRORS.CAMPAIGN_NOT_FOUND
              : null;
        toast.error(known ?? getApiErrorMessage(err) ?? BULK_UI.ERRORS.FAILED);
        return null;
      }
    },
  };
}
