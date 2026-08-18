// src/features/auth/hooks/useCreatePasswordForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPasswordSchema,
  type CreatePasswordSchema,
} from '../forms/createPassword-schema';

export function useCreatePasswordForm() {
  const form = useForm<CreatePasswordSchema>({
    resolver: zodResolver(createPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
      acceptCgu: false,
      acceptRgpd: false,
    },
  });

  return { form };
}