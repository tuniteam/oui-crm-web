import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { resetPasswordService } from '../services/reset-password.service';
import type { ApiErrorResponse } from '../types/reset-password';

export type ResetPasswordTokenState =
  | 'loading'
  | 'valid'
  | 'expired'
  | 'invalid';

function getApiErrorCode(err: unknown): string | null {
  const axiosErr = err as AxiosError<ApiErrorResponse>;
  return axiosErr?.response?.data?.messages?.code ?? null;
}

export function useValidateResetPasswordToken(token: string | null) {
  const query = useQuery({
    queryKey: ['auth', 'password-reset', token],
    enabled: !!token,
    retry: false,
    queryFn: () => resetPasswordService.validateToken(token as string),
  });

  let state: ResetPasswordTokenState = 'loading';

  if (!token) state = 'invalid';
  else if (query.isSuccess) state = 'valid';
  else if (query.isError) {
    const code = getApiErrorCode(query.error);

    if (code === 'PASSWORD_RESET_TOKEN_EXPIRED') state = 'expired';
    else state = 'invalid';
  }

  return {
    state,
    isLoading: query.isLoading,
    error: query.error,
  };
}