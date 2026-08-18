import { useContent } from '@/hooks/useContent';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { UpdateProfileHooks } from '../../hooks/useUpdateProfileForm';
import { UpdateProfileBodySkeleton } from './skeleton/UpdateProfileBodySkeleton';

type Props = {
  hooks: UpdateProfileHooks;
};

export function UpdateProfileBody({ hooks }: Props) {
  const { form, updateProfile: mutation, profileQuery } = hooks;
  const { updateProfile } = useContent();
  const isLoading = profileQuery.isLoading;
  const isBusy = mutation.loading;
  const { LABELS, PLACEHOLDERS } = updateProfile;
  if (isLoading) return <UpdateProfileBodySkeleton />;
  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.FIRST_NAME} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={PLACEHOLDERS.FIRST_NAME}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.LAST_NAME} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={PLACEHOLDERS.LAST_NAME}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.PHONE}</FormLabel>
              <FormControl>
                <Input
                  placeholder={PLACEHOLDERS.PHONE}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
