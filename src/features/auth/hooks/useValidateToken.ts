// src/features/auth/hooks/useValidateToken.ts
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/auth';
import { activateAccountService } from '../services/activate-account.service';

export type ActivationTokenState = 'loading' | 'valid' | 'expired' | 'invalid';

function getApiErrorCode(err: unknown): string | null {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr?.response?.data?.messages?.code ?? null;
}

export function useValidateToken(token: string | null) {
  const query = useQuery({
    queryKey: ['auth', 'activation', 'validate', token],
    enabled: !!token,
    queryFn: async () => {
      return activateAccountService.validateToken(token as string);
    },
    retry: false,
  });

  let state: ActivationTokenState = 'loading';

  if (!token) {
    state = 'invalid';
  } else if (query.isLoading) {
    state = 'loading';
  } else if (query.isSuccess) {
    state = 'valid';
  } else if (query.isError) {
    const code = getApiErrorCode(query.error);
    // Codes du contrat US-00-02 : tout le reste est un lien inexploitable.
    if (code === 'ACTIVATION_TOKEN_EXPIRED') state = 'expired';
    else state = 'invalid';
  }

  return {
    state,
    /** Identite et documents legaux a afficher, rendus par validate. */
    account: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  };
}