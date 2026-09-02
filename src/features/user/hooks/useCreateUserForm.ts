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
      initials: '',
      roleCode: '',
      isExternal: false,
      expiresAt: '',
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
      initials: v.initials.trim().toUpperCase(),
      roleCode: v.roleCode,
      isExternal: v.isExternal,
      // Le champ n'est envoye que s'il a un sens : le serveur refuse une date
      // sur un acces interne, et une chaine vide n'est pas une date valide.
      ...(v.isExternal && v.expiresAt ? { expiresAt: v.expiresAt } : {}),
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

