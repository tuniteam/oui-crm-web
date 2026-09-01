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

  return { create: mutation.mutateAsync, loading: mutation.isPending };
}
