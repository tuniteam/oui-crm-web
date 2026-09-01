import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CHANGE_PASSWORD_WINDOW } from '../constants/change-password.constants';
import { profileService } from '../services/profile-service';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
} from '../types/changePassword';

export function useChangePassword() {
  const mutation = useMutation<
    ChangePasswordResponse,
    Error,
    ChangePasswordPayload
  >({
    mutationFn: (payload) => profileService.changePassword(payload),

    onSuccess: () => {
      toast.success(CHANGE_PASSWORD_WINDOW.TOASTS.SUCCESS);
    },

    onError: (e) => {
      console.error(e);
      toast.error(e?.message ?? CHANGE_PASSWORD_WINDOW.TOASTS.ERROR);
    },
  });

  return {
    loading: mutation.isPending,
    changePassword: async (payload: ChangePasswordPayload) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch {
        return null;
      }
    },
  };
}
