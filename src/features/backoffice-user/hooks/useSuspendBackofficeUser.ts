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

  return { suspend: mutation.mutateAsync, loading: mutation.isPending };
}
