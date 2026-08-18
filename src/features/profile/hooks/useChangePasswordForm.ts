import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useChangePassword } from './useChangePassword';
import { ChangePasswordSchemaType, getChangePasswordSchema } from '../forms/change-password-schema';

export function useChangePasswordForm() {
  const schema = useMemo(() => getChangePasswordSchema(), []);
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const submit = async () => {
    const ok = await form.trigger();

    if (!ok) return null;

    const values = form.getValues();

    return await changePassword.changePassword({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    });
  };

  return {
    form,
    changePassword,
    submit,
  };
}

export type ChangePasswordHooks = ReturnType<typeof useChangePasswordForm>;