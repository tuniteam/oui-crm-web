import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TOASTS } from '../constants/constants';
import { backofficeUserService } from '../services/backoffice-user.service';

export function useResendBackofficeActivation() {
  const queryClient = useQueryClient();

  const mutation = useMutation<{ sent: boolean }, Error, string>({
    mutationFn: (userId) => backofficeUserService.resendActivation(userId),
    onSuccess: () => {
      toast.success(TOASTS.ACTIVATION_RESENT);
      queryClient.invalidateQueries({ queryKey: ['backoffice-users'] });
    },
    onError: (err) => toast.error(err.message),
  });

  /**
   * L'erreur est deja signalee par le toast de onError : on renvoie null
   * plutot que de rejeter, sinon chaque appelant doit envelopper son await
   * dans un try/catch et un oubli devient un rejet non capture.
   */
  const resend = async (...args: Parameters<typeof mutation.mutateAsync>) => {
    try {
      return await mutation.mutateAsync(...args);
    } catch {
      return null;
    }
  };

  return { resend, loading: mutation.isPending };
}
