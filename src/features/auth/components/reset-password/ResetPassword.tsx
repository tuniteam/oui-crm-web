import { useState } from 'react';
import { Check, LoaderCircleIcon } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '../../hooks/useResetPassword';
import { useResetPasswordForm } from '../../hooks/useResetPasswordForm';
import { PasswordValidators } from '../activation-token/PasswordValidators';
import { AuthLogo } from '../AuthLogo';

type Props = {
  token: string;
  onSuccess: () => void;
  onExpired: () => void;
  onInvalid: () => void;
};

type ResetPasswordError = 'unknown' | null;

export function ResetPassword({
  token,
  onSuccess,
  onExpired,
  onInvalid,
}: Props) {
  const { form } = useResetPasswordForm();
  const { reset, loading } = useResetPassword();
  const content = useContent();
  const ui = content.resetPassword.FORM;

  const [submitError, setSubmitError] = useState<ResetPasswordError>(null);

  const canSubmit = form.formState.isValid && !loading;
  const passwordValue = form.watch('password') ?? '';

  const handleSubmit = async () => {
    const values = form.getValues();
    setSubmitError(null);

    try {
      await reset({
        token,
        password: values.password,
      });

      onSuccess();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { messages?: { code?: string } } };
      };
      const code = err.response?.data?.messages?.code;

      if (code === 'PASSWORD_RESET_TOKEN_EXPIRED') {
        onExpired();
        return;
      }

      if (code === 'PASSWORD_RESET_TOKEN_INVALID') {
        onInvalid();
        return;
      }

      setSubmitError('unknown');
    }
  };

  return (
    <div className="mx-auto max-w-md bg-background">
      <AuthLogo />

      <h1 className="text-center text-xl font-semibold">{ui.TITLE}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {ui.DESCRIPTION}
      </p>

      {submitError === 'unknown' ? (
        <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {ui.ERROR_UNKNOWN}
        </div>
      ) : null}

      <div className="mt-6">
        <Form {...form}>
          <form
            className="space-y-4"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ui.FIELDS.PASSWORD_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={ui.FIELDS.PASSWORD_PLACEHOLDER}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ui.FIELDS.CONFIRM_PASSWORD_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={ui.FIELDS.CONFIRM_PASSWORD_PLACEHOLDER}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PasswordValidators password={passwordValue} />

            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircleIcon
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {ui.ACTIONS.SUBMITTING}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {ui.ACTIONS.SUBMIT}
                </span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
