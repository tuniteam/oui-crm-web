import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessageOr } from '@/shared/utils/api-error';
import type { CreateUserPayload, CreateUserResponse } from '../types/createUser';
import { userService } from '../services/user.service';
import { TOASTS } from '../constants/users.constants';
import { USER_STATUS } from '../constants/userList.constants';

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateUserResponse, Error, CreateUserPayload>({
    mutationFn: (payload) => userService.create(payload),

    onSuccess: async (created, payload) => {
      toast.success(
        created.status === USER_STATUS.PENDING
          ? TOASTS.USER_INVITED(payload.email)
          : TOASTS.USER_ATTACHED,
      );

      await queryClient.invalidateQueries({
        queryKey: ['users', 'list'],
        exact: false,
      });
    },

    onError: (e) => {
      console.error(e);
      /* Le refus a un code — initiales prises, adresse deja membre, externe
         sans echeance — et la table partagee le traduit. */
      toast.error(apiMessageOr(e, TOASTS.CREATE_USER_ERROR));
    },
  });

  return {
    loading: mutation.isPending,
    createUser: async (payload: CreateUserPayload) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch {
        return null;
      }
    },
  };
}
