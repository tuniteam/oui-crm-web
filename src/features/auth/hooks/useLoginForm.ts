import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLoginSchema, LoginSchemaType } from '../forms/login-schema';
import { useLogin } from './useLogin';

export function useLoginForm() {
  const schema = useMemo(() => getLoginSchema(), []);
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onSubmit',
  });

  const login = useLogin();

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const { email, password } = form.getValues();
    return await login.signIn({ email, password });
  };

  return {
    form,
    submit,
    loading: login.loading,
  };
}
