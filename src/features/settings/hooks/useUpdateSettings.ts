import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SETTINGS_TOASTS } from '../constants/constants';
import { settingsService } from '../services/settings.service';
import type {
  SettingsResponse,
  UpdateSettingsPayload,
} from '../types/settings';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    SettingsResponse,
    Error,
    UpdateSettingsPayload
  >({
    mutationFn: settingsService.update,
    onSuccess: (data) => {
      toast.success(SETTINGS_TOASTS.SAVED);
      // La reponse contient l'etat complet : on evite un refetch.
      queryClient.setQueryData(['settings'], data);
    },
    onError: (err) => toast.error(err.message),
  });

  /** Renvoie null en cas d'echec : l'erreur est deja signalee par le toast. */
  const update = async (payload: UpdateSettingsPayload) => {
    try {
      return await mutation.mutateAsync(payload);
    } catch {
      return null;
    }
  };

  return { update, loading: mutation.isPending };
}
