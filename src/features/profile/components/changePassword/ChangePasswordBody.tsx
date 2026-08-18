
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Circle } from 'lucide-react';
import { PasswordValidators } from '@/features/auth/components/activation-token/PasswordValidators';
import { useContent } from '@/hooks/useContent';
import { cn } from '@/lib/utils';
import type { ChangePasswordHooks } from '../../hooks/useChangePasswordForm';

type Props = {
  hooks: ChangePasswordHooks;
};

export function ChangePasswordBody({ hooks }: Props) {
  const { form, changePassword: mutation } = hooks;
  const { changePassword } = useContent();

  const isBusy = mutation.loading;

  const oldPassword = form.watch('oldPassword');
  const newPassword = form.watch('newPassword');
  const confirmPassword = form.watch('confirmNewPassword');

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;

  const differentFromOld =
    oldPassword && newPassword && oldPassword !== newPassword;

  const { LABELS, PLACEHOLDERS } = changePassword;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.OLD_PASSWORD} *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={PLACEHOLDERS.OLD_PASSWORD}
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
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.NEW_PASSWORD} *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={PLACEHOLDERS.NEW_PASSWORD}
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
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{LABELS.CONFIRM_NEW_PASSWORD} *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={PLACEHOLDERS.CONFIRM_NEW_PASSWORD}
                  disabled={isBusy}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordValidators password={newPassword ?? ''} />

        <div className="rounded-md border p-3 space-y-2 text-sm">
          <div
            className={cn(
              'flex items-center gap-2',
              differentFromOld ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            {differentFromOld ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {LABELS.DIFFERENT_FROM_OLD}
          </div>

          <div
            className={cn(
              'flex items-center gap-2',
              passwordsMatch ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            {passwordsMatch ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
            {LABELS.PASSWORDS_MATCH}
          </div>
        </div>
      </form>
    </Form>
  );
}