import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TOASTS } from '../constants/constants';
import { backofficeUserService } from '../services/backoffice-user.service';
import type {
  BackofficeUserDetails,
  UpdateBackofficeUserPayload,
} from '../types/backofficeUser';

type Vars = { userId: string; payload: UpdateBackofficeUserPayload };

export function useUpdateBackofficeUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<BackofficeUserDetails, Error, Vars>({
    mutationFn: ({ userId, payload }) =>
      backofficeUserService.update(userId, payload),
    onSuccess: () => {
      toast.success(TOASTS.UPDATED);
      queryClient.invalidateQueries({ queryKey: ['backoffice-users'] });
    },
    onError: (err) => toast.error(err.message),
  });

  /**
   * L'erreur est deja signalee par le toast de onError : on renvoie null
   * plutot que de rejeter, sinon chaque appelant doit envelopper son await
   * dans un try/catch et un oubli devient un rejet non capture.
   */
  const update = async (...args: Parameters<typeof mutation.mutateAsync>) => {
    try {
      return await mutation.mutateAsync(...args);
    } catch {
      return null;
    }
  };

  return { update, loading: mutation.isPending };
}
