import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  getUpdateProfileSchema,
  UpdateProfileSchemaType,
} from '../forms/update-profile-schema';
import { useGetMyProfile } from './useGetMyProfile';
import { useUpdateProfile } from './useUpdateProfile';

export function useUpdateProfileForm() {
  const schema = useMemo(() => getUpdateProfileSchema(), []);
  const updateProfile = useUpdateProfile();
  const profileQuery = useGetMyProfile();

  const form = useForm<UpdateProfileSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    form.reset({
      firstName: profileQuery.data.firstName ?? '',
      lastName: profileQuery.data.lastName ?? '',
      phone: profileQuery.data.phone ?? '',
    });

    form.trigger();
  }, [profileQuery.data, form]);

  const submit = async () => {
    const ok = await form.trigger();
    if (!ok) return null;

    const values = form.getValues();

    return await updateProfile.updateProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim() ? values.phone.trim() : null,
    });
  };

  return {
    form,
    updateProfile,
    profileQuery,
    submit,
  };
}

export type UpdateProfileHooks = ReturnType<typeof useUpdateProfileForm>;
