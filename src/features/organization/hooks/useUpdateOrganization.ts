import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { ORGANIZATION_DETAIL_UI } from '../constants/organizationDetail.constants';
import { organizationService } from '../services/organization.service';
import type {
  OrganizationDetail,
  UpdateOrganizationPayload,
} from '../types/organizationDetail';

export function useUpdateOrganization(id?: string) {
  const queryClient = useQueryClient();
  const projectId = useMeStore((s) => s.activeProjectId);

  const mutation = useMutation<
    OrganizationDetail,
    Error,
    UpdateOrganizationPayload
  >({
    mutationFn: (payload) =>
      organizationService.update(id as string, payload),

    onSuccess: (updated) => {
      toast.success(ORGANIZATION_DETAIL_UI.TOASTS.SAVED);

      // La reponse est la fiche a jour : on la place dans le cache plutot que
      // de la redemander. La liste, elle, porte des champs derives (score de
      // completude, strate) : on l'invalide pour qu'elle les recalcule.
      queryClient.setQueryData(
        ['organizations', 'detail', projectId, updated.id],
        updated,
      );
      queryClient.invalidateQueries({
        queryKey: ['organizations', 'list'],
        exact: false,
      });
    },

    onError: (e) => {
      toast.error(e?.message ?? ORGANIZATION_DETAIL_UI.TOASTS.SAVE_ERROR);
    },
  });

  return {
    loading: mutation.isPending,
    update: async (payload: UpdateOrganizationPayload) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch {
        return null;
      }
    },
  };
}
