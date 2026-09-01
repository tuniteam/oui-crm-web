import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TOASTS } from '../constants/constants';
import { backofficeUserService } from '../services/backoffice-user.service';

/** DELETE suspend l'acces ; le compte reste et peut etre reactive. */
export function useSuspendBackofficeUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string>({
    mutationFn: (userId) => backofficeUserService.suspend(userId),
    onSuccess: () => {
      toast.success(TOASTS.SUSPENDED);
      queryClient.invalidateQueries({ queryKey: ['backoffice-users'] });
    },
    onError: (err) => toast.error(err.message),
  });

  /**
   * L'erreur est deja signalee par le toast de onError : on renvoie null
   * plutot que de rejeter, sinon chaque appelant doit envelopper son await
   * dans un try/catch et un oubli devient un rejet non capture.
   */
  const suspend = async (...args: Parameters<typeof mutation.mutateAsync>) => {
    try {
      return await mutation.mutateAsync(...args);
    } catch {
      return null;
    }
  };

  return { suspend, loading: mutation.isPending };
}
