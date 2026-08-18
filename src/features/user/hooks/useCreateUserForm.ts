import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  getCreateUserSchema,
  type CreateUserSchemaType,
} from '../forms/create-user-schema';
import type { CreateUserPayload } from '../types/createUser';
import { useCreateUser } from './useCreateUser';

export function useCreateUserForm() {
  const schema = useMemo(() => getCreateUserSchema(), []);
  const form = useForm<CreateUserSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
    },
    mode: 'onChange',
  });

  const create = useCreateUser();

  const buildPayload = (): CreateUserPayload => {
    const v = form.getValues();

    return {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.toLowerCase().trim(),
      roleId: v.roleId,
    };
  };

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const payload = buildPayload();
    return await create.createUser(payload);
  };

  return { form, create, submit };
}
