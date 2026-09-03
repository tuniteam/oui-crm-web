import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import {
  getApiErrorCode,
  getApiErrorMessage,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import {
  CAMPAIGN_ERRORS,
  CAMPAIGNS_UI,
} from '../constants/campaign.constants';
import { campaignService } from '../services/campaign.service';
import type {
  BlockingScope,
  Campaign,
  CampaignStatus,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../types/campaign';

/** Un nom deja pris n'est pas un echec technique : c'est une correction a
 *  faire dans le champ. */
/**
 * Une suppression refusee n'est pas une suppression echouee : un perimetre
 * cite la campagne, et il faut le detacher d'abord. Le contrat nomme les
 * fautifs dans `messages.meta.scopes` — le front les rend, il ne nettoie rien
 * tout seul.
 */
export type CampaignDeleteOutcome =
  | { status: 'deleted' }
  | { status: 'in-use'; scopes: BlockingScope[] }
  | { status: 'error' };

export type CampaignWriteOutcome =
  | { status: 'saved'; campaign: Campaign }
  | { status: 'name-taken' }
  | { status: 'error' };

export function useCampaignMutations() {
  const queryClient = useQueryClient();
  const projectId = useMeStore((s) => s.activeProjectId);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['campaigns'],
      exact: false,
    });
  }, [queryClient]);

  const createMutation = useMutation<Campaign, unknown, CreateCampaignPayload>({
    mutationFn: (payload) => campaignService.create(payload),
  });

  const updateMutation = useMutation<
    Campaign,
    unknown,
    { id: string; payload: UpdateCampaignPayload }
  >({
    mutationFn: ({ id, payload }) => campaignService.update(id, payload),
  });

  const deleteMutation = useMutation<void, unknown, string>({
    mutationFn: (id) => campaignService.remove(id),
  });

  const statusMutation = useMutation<
    Campaign,
    unknown,
    { id: string; status: CampaignStatus }
  >({
    mutationFn: ({ id, status }) => campaignService.setStatus(id, status),
  });

  const settle = useCallback((err: unknown): CampaignWriteOutcome => {
    if (getApiErrorCode(err) === CAMPAIGN_ERRORS.NAME_EXISTS) {
      return { status: 'name-taken' };
    }
    toast.error(getApiErrorMessage(err));
    return { status: 'error' };
  }, []);

  return {
    saving: createMutation.isPending || updateMutation.isPending,
    changingStatus: statusMutation.isPending,
    deleting: deleteMutation.isPending,
    // `projectId` sert la cle de cache ; on l'expose pour les tests de rendu.
    projectId,

    create: async (payload: CreateCampaignPayload) => {
      try {
        const campaign = await createMutation.mutateAsync(payload);
        toast.success(CAMPAIGNS_UI.TOASTS.CREATED);
        invalidate();
        return { status: 'saved', campaign } as CampaignWriteOutcome;
      } catch (err) {
        return settle(err);
      }
    },

    update: async (id: string, payload: UpdateCampaignPayload) => {
      try {
        const campaign = await updateMutation.mutateAsync({ id, payload });
        toast.success(CAMPAIGNS_UI.TOASTS.UPDATED);
        invalidate();
        return { status: 'saved', campaign } as CampaignWriteOutcome;
      } catch (err) {
        return settle(err);
      }
    },

    /**
     * Supprimer, ou dire quels perimetres l'empechent.
     *
     * `meta.scopes` peut manquer si le serveur ne le remplit pas : on rend
     * alors une liste vide plutot que d'inventer un nom, et l'ecran le dit.
     */
    remove: async (id: string): Promise<CampaignDeleteOutcome> => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(CAMPAIGNS_UI.TOASTS.DELETED);
        invalidate();
        return { status: 'deleted' };
      } catch (err) {
        if (getApiErrorCode(err) === CAMPAIGN_ERRORS.IN_USE_BY_SCOPE) {
          const raw = getApiErrorMeta(err)?.scopes;
          return {
            status: 'in-use',
            scopes: Array.isArray(raw) ? (raw as BlockingScope[]) : [],
          };
        }
        toast.error(getApiErrorMessage(err));
        return { status: 'error' };
      }
    },

    /**
     * L'ecran ne propose que les transitions legales, donc un refus du serveur
     * signale une divergence — une campagne changee ailleurs entre l'affichage
     * et le clic. On recharge plutot que de laisser l'ecran mentir.
     */
    setStatus: async (id: string, status: CampaignStatus) => {
      try {
        await statusMutation.mutateAsync({ id, status });
        toast.success(CAMPAIGNS_UI.TOASTS.STATUS_CHANGED);
        invalidate();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err));
        if (getApiErrorCode(err) === CAMPAIGN_ERRORS.INVALID_TRANSITION) {
          invalidate();
        }
        return false;
      }
    },
  };
}
