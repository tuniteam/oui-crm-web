import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { getApiErrorMessage } from '@/shared/utils/api-error';
import { CAMPAIGN_TARGET_UI } from '../constants/campaign.constants';
import { campaignService } from '../services/campaign.service';
import type { CampaignTargetReport } from '../types/campaign';
import type { OrganizationListItem } from '@/features/organization/types/organizationList';

/** La cible figee d'une campagne — L1 · US-01-11, tranche B. */
export function useCampaignTarget(campaignId: string | null, open: boolean) {
  const projectId = useMeStore((s) => s.activeProjectId);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['campaigns', 'target', projectId, campaignId, page],
    queryFn: () => campaignService.getTarget(campaignId as string, { page, limit: 20 }),
    enabled: open && !!campaignId,
  });

  /**
   * Toute ecriture sur la cible touche trois choses.
   *
   * La cible elle-meme, la liste des campagnes — `organizationsCount` y figure
   * — et **la liste des organismes** : cibler une fiche `NOT_CONTACTED` la fait
   * passer `TO_CONTACT` cote serveur. Ne rafraichir que la cible laisserait la
   * liste afficher un statut perime.
   */
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['campaigns'], exact: false });
    queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
  }, [queryClient]);

  const addMutation = useMutation<CampaignTargetReport, unknown, string[]>({
    mutationFn: (ids) => campaignService.addToTarget(campaignId as string, ids),
  });

  const removeMutation = useMutation<void, unknown, string>({
    mutationFn: (orgId) =>
      campaignService.removeFromTarget(campaignId as string, orgId),
  });

  return {
    organizations: (query.data?.data ?? []) as OrganizationListItem[],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    page,
    setPage,
    busy: addMutation.isPending || removeMutation.isPending,

    /**
     * Rend le compte rendu complet plutot qu'un simple « enregistre » : une
     * selection partielle n'echoue jamais, et taire `alreadyIn` ou `skipped`
     * masquerait les fiches qui n'ont pas suivi.
     */
    add: async (ids: string[]): Promise<CampaignTargetReport | null> => {
      try {
        const report = await addMutation.mutateAsync(ids);
        toast.success(
          CAMPAIGN_TARGET_UI.REPORT(report.added, report.alreadyIn, report.skipped),
        );
        invalidate();
        return report;
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        return null;
      }
    },

    remove: async (orgId: string) => {
      try {
        await removeMutation.mutateAsync(orgId);
        toast.success(CAMPAIGN_TARGET_UI.REMOVED);
        invalidate();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        return false;
      }
    },
  };
}
