// src/features/user/hooks/useDeleteUser.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userService } from '../services/user.service';
import { useContent } from '@/hooks/useContent';

type Vars = { userId: string };

export function useDeleteUser() {
  const content = useContent();

  return useMutation<void, Error, Vars>({
    mutationFn: ({ userId }) => userService.delete(userId),

    onSuccess: async () => {
      toast.success(content.user.delete.toasts.USER_DELETED);
    },

    onError: (err) => {
      const msg =
        err instanceof Error
          ? err.message
          : content.user.delete.errors.DELETE_USER;

      toast.error(msg);
      console.error(msg);
    },

    retry: 0,
  });
}
