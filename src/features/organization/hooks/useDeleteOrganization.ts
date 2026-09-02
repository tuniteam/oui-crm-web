import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DELETE_ORGANIZATION_TOASTS } from '../constants/organizationDelete.constants';
import { organizationService } from '../services/organization.service';

/** Suppression d'un organisme — US-01-13. */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (id) => organizationService.remove(id),

    onSuccess: () => {
      toast.success(DELETE_ORGANIZATION_TOASTS.DELETED);
      // La fiche disparait des lectures : le detail en cache ne vaut plus
      // rien, et la liste doit recompter.
      queryClient.invalidateQueries({
        queryKey: ['organizations'],
        exact: false,
      });
    },

    onError: (e) => {
      toast.error(e?.message ?? DELETE_ORGANIZATION_TOASTS.ERROR);
    },
  });

  return {
    loading: mutation.isPending,
    remove: async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
  };
}
