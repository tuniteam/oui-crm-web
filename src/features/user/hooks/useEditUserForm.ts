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

export function useEditUserForm(
  userId: string,
  isEditDrawerOpen: boolean,
  currentUserEmail?: string,
) {
  const schema = useMemo(() => getEditUserSchema(), []);
  const update = useUpdateUser();
  const userQuery = useUser(userId, isEditDrawerOpen);

  const form = useForm<EditUserSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      initials: '',
      roleCode: '',
      scopeId: '',
      isExternal: false,
      expiresAt: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const u = userQuery.data;
    if (!u) return;

    form.reset({
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      initials: u.initials ?? '',
      roleCode: u.roleCode ?? '',
      // Le serveur rend le perimetre en objet `{ id, name }` ; le formulaire
      // travaille sur l'identifiant.
      scopeId: u.scope?.id ?? '',
      isExternal: u.isExternal ?? false,
      // Le serveur rend un jour calendaire ; on ne garde que la partie date au
      // cas ou il renverrait un horodatage complet.
      expiresAt: u.expiresAt ? u.expiresAt.slice(0, 10) : '',
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
      initials: v.initials.trim().toUpperCase(),
      // Sur son propre compte, le serveur refuse le changement de role
      // (CANNOT_UPDATE_OWN_ROLE) et d'acces (CANNOT_UPDATE_OWN_ACCESS) :
      // anti-escalade de privileges. On n'envoie donc ni l'un ni l'autre.
      ...(isCurrentUser
        ? {}
        : {
            roleCode: v.roleCode,
            scopeId: v.scopeId || null,
            // `null` retire explicitement le perimetre : l'utilisateur
            // retrouve alors l'acces a toute la base.

            // `null` retire explicitement la date : c'est ainsi qu'un acces
            // externe redevient permanent.
            expiresAt: v.isExternal && v.expiresAt ? v.expiresAt : null,
          }),
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

