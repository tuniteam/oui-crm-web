import { useMutation } from '@tanstack/react-query';
import { resetPasswordService } from '../services/reset-password.service';

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: resetPasswordService.resetPassword,
  });

  return {
    reset: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}