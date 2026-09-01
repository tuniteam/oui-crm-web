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

  return { resend: mutation.mutateAsync, loading: mutation.isPending };
}
