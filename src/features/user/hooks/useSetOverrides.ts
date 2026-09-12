import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiMessageOr } from '@/shared/utils/api-error';
import { OVERRIDES_UI } from '../constants/overrides.constants';
import { userService } from '../services/user.service';
import type { UserDetailsResponse } from '../types/userDetails';

type Vars = { userId: string; added: string[]; removed: string[] };

/**
 * Enregistrer les exceptions de droits — US-00-05 §4.
 *
 * Les deux tableaux partent **toujours**, même vides : le serveur lit un
 * remplacement, pas un delta. Envoyer `{ added: [] }` seul serait refusé,
 * `removed` étant obligatoire au DTO.
 */
export function useSetOverrides() {
  const queryClient = useQueryClient();

  const mutation = useMutation<UserDetailsResponse, unknown, Vars>({
    mutationFn: ({ userId, added, removed }) =>
      userService.setOverrides(userId, { added, removed }),
    onSuccess: (_data, { userId }) => {
      toast.success(OVERRIDES_UI.DRAWER.DONE);
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
    onError: (err) => {
      toast.error(apiMessageOr(err, OVERRIDES_UI.ERRORS.SAVE));
    },
  });

  const save = async (vars: Vars): Promise<boolean> => {
    try {
      await mutation.mutateAsync(vars);
      return true;
    } catch {
      return false;
    }
  };

  return { save, pending: mutation.isPending };
}
