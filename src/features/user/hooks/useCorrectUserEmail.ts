import { getApiErrorCode } from '@/shared/utils/api-error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type {
  CorrectEmailPayload,
  CorrectEmailResponse,
} from '../types/correctEmail';

type CorrectResult =
  | { ok: true; email: string }
  | { ok: false; code: string | null };

/** Mutation PATCH /users/:id/email — renvoie le code d'erreur brut au form. */
export function useCorrectUserEmail(userId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CorrectEmailResponse,
    unknown,
    CorrectEmailPayload
  >({
    mutationFn: (payload) => userService.correctEmail(userId, payload),
  });

  return {
    loading: mutation.isPending,
    correct: async (payload: CorrectEmailPayload): Promise<CorrectResult> => {
      try {
        const data = await mutation.mutateAsync(payload);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        return { ok: true, email: data.email };
      } catch (err) {
        return { ok: false, code: getApiErrorCode(err) };
      }
    },
  };
}
