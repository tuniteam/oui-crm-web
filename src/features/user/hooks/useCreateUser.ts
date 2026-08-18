import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateUserPayload, CreateUserResponse } from '../types/createUser';
import { userService } from '../services/user.service';
import { TOASTS } from '../constants/users.constants';

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateUserResponse, Error, CreateUserPayload>({
    mutationFn: (payload) => userService.create(payload),

    onSuccess: async () => {
      toast.success(TOASTS.USER_CREATED);

      await queryClient.invalidateQueries({
        queryKey: ['users', 'list'],
        exact: false,
      });
    },

    onError: (e) => {
      console.error(e);
      toast.error(e instanceof Error ? e.message : TOASTS.CREATE_USER_ERROR);
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
