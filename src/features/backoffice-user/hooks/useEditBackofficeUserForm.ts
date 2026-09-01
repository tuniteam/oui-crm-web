import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  editBackofficeUserSchema,
  type EditBackofficeUserSchema,
} from '../forms/edit-backoffice-user-schema';
import type { BackofficeUserDetails } from '../types/backofficeUser';
import { useBackofficeRoles } from './useBackofficeRoles';
import { useUpdateBackofficeUser } from './useUpdateBackofficeUser';

export function useEditBackofficeUserForm(user?: BackofficeUserDetails) {
  const schema = useMemo(() => editBackofficeUserSchema, []);

  const form = useForm<EditBackofficeUserSchema>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', roleCode: '' },
    mode: 'onSubmit',
  });

  // Le drawer refetch a chaque ouverture : on resynchronise le formulaire sur
  // les donnees fraiches plutot que de garder un etat local perime.
  useEffect(() => {
    if (!user) return;
    form.reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      roleCode: user.roleCode ?? '',
    });
  }, [user, form]);

  const { roles, loading: rolesLoading, error: rolesError } = useBackofficeRoles();
  const { update, loading } = useUpdateBackofficeUser();

  const submit = async () => {
    if (!user) return null;
    const ok = await form.trigger();
    if (!ok) return null;
    return update({ userId: user.id, payload: form.getValues() });
  };

  return { form, submit, loading, roles, rolesLoading, rolesError };
}

export type EditBackofficeUserHooks = ReturnType<
  typeof useEditBackofficeUserForm
>;
