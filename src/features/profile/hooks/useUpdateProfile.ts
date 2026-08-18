import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UPDATE_PROFILE_SHEET } from '../constants/update-profile.constants';
import { profileService } from '../services/profile-service';
import type {
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../types/updateProfile';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UpdateProfileResponse,
    Error,
    UpdateProfilePayload
  >({
    mutationFn: (payload) => profileService.updateProfile(payload),

    onSuccess: async () => {
      toast.success(UPDATE_PROFILE_SHEET.TOASTS.SUCCESS);
      await queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },

    onError: (e) => {
      toast.error(e?.message ?? UPDATE_PROFILE_SHEET.TOASTS.ERROR);
    },
  });

  return {
    loading: mutation.isPending,
    updateProfile: async (payload: UpdateProfilePayload) => {
      try {
        return await mutation.mutateAsync(payload);
      } catch {
        return null;
      }
    },
  };
}
