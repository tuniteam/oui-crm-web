import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { LoginPayload, LoginResponse } from '../types/auth';

export function useLogin() {
  const mutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: authService.login,
  });

  return {
    loading: mutation.isPending,
    signIn: mutation.mutateAsync,
  };
}
