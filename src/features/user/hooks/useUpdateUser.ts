// src/features/users/hooks/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessageOr } from '@/shared/utils/api-error';
import { TOASTS } from '../constants/users.constants';
import { ERRORS } from '../constants/userList.constants';
import type { UpdateUserPayload, UpdateUserResponse } from '../types/updateUser';
import { userService } from '../services/user.service';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UpdateUserResponse,
    Error,
    { userId: string; payload: UpdateUserPayload }
  >({
    mutationFn: ({ userId, payload }) => userService.update(userId, payload),

    onSuccess: (_data, variables) => {
      toast.success(TOASTS.USER_UPDATED);

      // Refetch detail + any users lists (whatever params)
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },

    onError: (e) => {
      console.error(e);
      /* `e.message` d'une erreur axios est technique et en anglais — « Request
         failed with status code 409 ». Le message francais se demande a
         l'enveloppe, qui porte le code : initiales prises, dernier
         administrateur, son propre role. */
      toast.error(apiMessageOr(e, ERRORS.API_GENERIC));
    },
  });

  return {
    loading: mutation.isPending,
    updateUser: async (userId: string, payload: UpdateUserPayload) => {
      try {
        return await mutation.mutateAsync({ userId, payload });
      } catch {
        return null;
      }
    },
  };
}
