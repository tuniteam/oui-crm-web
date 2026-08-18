import { useMutation } from '@tanstack/react-query';
import { resetPasswordService } from '../services/reset-password.service';

export function useRequestChangePassword() {
  const mutation = useMutation({
    mutationFn: resetPasswordService.requestReset,
  });

  return {
    request: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}