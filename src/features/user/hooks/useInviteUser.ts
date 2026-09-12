import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessageOr } from '@/shared/utils/api-error';
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
    mutationFn: ({ userId }) => userService.resendActivation(userId),

    onSuccess: (data, variables) => {
      /* `sent: false` est un 200 : la route a fait son travail, c'est le SMTP
         qui n'a pas pu envoyer. Le dire, et dire que la faute n'est pas du
         cote de l'utilisateur — sans quoi il recliquerait en boucle. */
      if (data.sent) toast.success(INVITE_USER_CARD.TOASTS.SUCCESS);
      else toast.error(INVITE_USER_CARD.TOASTS.NOT_SENT);

      queryClient.invalidateQueries({ queryKey: ['users', 'detail', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },

    onError: (e) => {
      /* `e.message` d'une erreur axios est technique et en anglais. Le code
         porte le sens : `USER_ALREADY_ACTIVE` quand le compte est deja
         active, donc quand l'ecran proposait un geste devenu inutile. */
      toast.error(apiMessageOr(e, ERRORS.API_GENERIC));
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
