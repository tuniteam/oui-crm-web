import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createBackofficeUserSchema,
  type CreateBackofficeUserSchema,
} from '../forms/create-backoffice-user-schema';
import { useBackofficeRoles } from './useBackofficeRoles';
import { useCreateBackofficeUser } from './useCreateBackofficeUser';

export function useCreateBackofficeUserForm() {
  const schema = useMemo(() => createBackofficeUserSchema, []);

  const form = useForm<CreateBackofficeUserSchema>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', roleCode: '' },
    mode: 'onSubmit',
  });

  const { roles, loading: rolesLoading, error: rolesError } = useBackofficeRoles();
  const { create, loading } = useCreateBackofficeUser();

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;
    return create(form.getValues());
  };

  return { form, submit, loading, roles, rolesLoading, rolesError };
}

export type CreateBackofficeUserHooks = ReturnType<
  typeof useCreateBackofficeUserForm
>;
