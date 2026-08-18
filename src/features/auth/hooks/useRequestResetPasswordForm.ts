import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  requestResetPasswordSchema,
  type RequestResetPasswordSchema,
} from '../forms/requestResetPassword-schema';

export function useRequestResetPasswordForm() {
  const form = useForm<RequestResetPasswordSchema>({
    resolver: zodResolver(requestResetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  return { form };
}