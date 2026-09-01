import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TOASTS } from '../constants/constants';
import { backofficeUserService } from '../services/backoffice-user.service';
import type {
  CreateBackofficeUserPayload,
  CreateBackofficeUserResponse,
} from '../types/backofficeUser';

export function useCreateBackofficeUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CreateBackofficeUserResponse,
    Error,
    CreateBackofficeUserPayload
  >({
    mutationFn: backofficeUserService.create,
    onSuccess: () => {
      toast.success(TOASTS.CREATED);
      queryClient.invalidateQueries({ queryKey: ['backoffice-users'] });
    },
    onError: (err) => toast.error(err.message),
  });

  /**
   * L'erreur est deja signalee par le toast de onError : on renvoie null
   * plutot que de rejeter, sinon chaque appelant doit envelopper son await
   * dans un try/catch et un oubli devient un rejet non capture.
   */
  const create = async (...args: Parameters<typeof mutation.mutateAsync>) => {
    try {
      return await mutation.mutateAsync(...args);
    } catch {
      return null;
    }
  };

  return { create, loading: mutation.isPending };
}
