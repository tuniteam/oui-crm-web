import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_ERROR_CODE } from '@/shared/constants/api-errors';
import {
  apiMessageOr,
  getApiErrorCode,
  getApiErrorMeta,
} from '@/shared/utils/api-error';
import { DELETE_ACCOUNT_UI } from '../constants/delete-account.constants';
import { userService } from '../services/user.service';

/** Ce que l'écran fait du refus : nommer les compteurs, ou rien de plus. */
export type DeleteAccountFailure =
  | { kind: 'REFERENCES'; counts: Record<string, number> }
  | { kind: 'HANDLED' };

/**
 * Supprimer définitivement un compte — US-00-05 §7, irréversible.
 *
 * `409 USER_HAS_REFERENCES` **remonte à l'appelant avec ses compteurs** au lieu
 * d'être annoncé par un bandeau : l'écran doit dire ce qui retient la
 * suppression, et proposer le retrait à la place. Un message au coin de l'écran
 * laisserait l'utilisateur devant une impasse.
 *
 * Les autres refus sont prévisibles et déjà traduits — dernier administrateur,
 * son propre compte : un message suffit.
 */
export function useDeleteUserAccount() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, unknown, string>({
    mutationFn: userService.deleteAccount,
    onSuccess: () => {
      toast.success(DELETE_ACCOUNT_UI.WINDOW.DONE);
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });

  const deleteAccount = async (
    userId: string,
  ): Promise<true | DeleteAccountFailure> => {
    try {
      await mutation.mutateAsync(userId);
      return true;
    } catch (err) {
      if (getApiErrorCode(err) === API_ERROR_CODE.USER_HAS_REFERENCES) {
        /* Seules les clés numériques nous intéressent : `meta` est libre côté
           serveur, et une valeur d'un autre type n'est pas un compteur. */
        const meta = getApiErrorMeta(err) ?? {};
        const counts: Record<string, number> = {};
        for (const [key, value] of Object.entries(meta)) {
          if (typeof value === 'number' && value > 0) counts[key] = value;
        }
        return { kind: 'REFERENCES', counts };
      }
      toast.error(apiMessageOr(err, DELETE_ACCOUNT_UI.ERRORS.DELETE));
      return { kind: 'HANDLED' };
    }
  };

  return { deleteAccount, pending: mutation.isPending };
}
