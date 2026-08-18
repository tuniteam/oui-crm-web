// src/features/auth/hooks/useActivateAccount.ts
import { useMutation } from '@tanstack/react-query';
import { activateAccountService } from '../services/activate-account.service';
import type {
  ActivationCompletePayload,
  ActivationCompleteResponse,
} from '../types/auth';

type ActivateResult =
  | { ok: true; data: ActivationCompleteResponse }
  | { ok: false; error: unknown };

export function useActivateAccount() {
  const mutation = useMutation<
    ActivationCompleteResponse,
    unknown,
    ActivationCompletePayload
  >({
    mutationFn: (payload) => activateAccountService.completeActivation(payload),
  });

  return {
    loading: mutation.isPending,
    data: mutation.data ?? null,
    error: mutation.error ?? null,
    activate: async (payload: ActivationCompletePayload): Promise<ActivateResult> => {
      try {
        const data = await mutation.mutateAsync(payload);
        return { ok: true, data };
      } catch (error) {
        return { ok: false, error };
      }
    },
  };
}