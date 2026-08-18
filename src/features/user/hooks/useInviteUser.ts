import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { INVITE_USER_CARD } from '../constants/invite-user.constants';
import { ERRORS } from '../constants/userList.constants';
import { userService } from '../services/user.service';

export function useInviteUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { sent: boolean },
    Error,
    { userId: string }
  >({
    mutationFn: ({ userId }) => userService.invite(userId),

    onSuccess: (_data, variables) => {
      toast.success(INVITE_USER_CARD.TOASTS.SUCCESS);

      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },

    onError: (e) => {
      toast.error(e?.message ?? ERRORS.API_GENERIC);
    },
  });

  return {
    loading: mutation.isPending,
    inviteUser: async (userId: string) => {
      try {
        return await mutation.mutateAsync({ userId });
      } catch {
        return null;
      }
    },
  };
}
