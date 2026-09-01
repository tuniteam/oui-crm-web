import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  getEditUserSchema,
  type EditUserSchemaType,
} from '../forms/edit-user-schema';
import type { UpdateUserPayload } from '../types/updateUser';
import { useUpdateUser } from './useUpdateUser';
import { useUser } from './useUser';

export function useEditUserForm(userId: string, isEditDrawerOpen: boolean,currentUserEmail?:string) {
  const schema = useMemo(() => getEditUserSchema(), []);
  const update = useUpdateUser();
  const userQuery = useUser(userId, isEditDrawerOpen);

  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      status: 'PENDING',
      roleId: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const u = userQuery.data;
    if (!u) return;

    form.reset({
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      status: u.status ?? 'PENDING',
      roleId: '',
    });
  }, [userQuery.data, form]);

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const v = form.getValues();
    const isCurrentUser = currentUserEmail === userQuery.data?.email;
    const payload: UpdateUserPayload = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      status: v.status,
      ...(isCurrentUser ? {} : { roleId: v.roleId }),
    };

    return update.updateUser(userId, payload);
  };

  return {
    form,
    update,
    user: userQuery.data ?? null,
    loadingUser: userQuery.isLoading,
    fetchingUser: userQuery.isFetching,
    submit,
  };
}

export type EditUserHooks = ReturnType<typeof useEditUserForm>;
