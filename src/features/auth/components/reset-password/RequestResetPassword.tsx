import { useState } from 'react';
import { ArrowLeft, LoaderCircleIcon, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { AUTH_ROUTES } from '../../constants/routes.constants';
import { useRequestChangePassword } from '../../hooks/useRequestChangePassword';
import { useRequestResetPasswordForm } from '../../hooks/useRequestResetPasswordForm';
import { AuthLogo } from '../AuthLogo';

type Props = {
  onSuccess: (email: string) => void;
};

export function RequestResetPassword({ onSuccess }: Props) {
  const navigate = useNavigate();
  const { form } = useRequestResetPasswordForm();
  const { request, loading } = useRequestChangePassword();
  const content = useContent();
  const ui = content.resetPassword.REQUEST;

  const [error, setError] = useState<string | null>(null);

  const canSubmit = form.formState.isValid && !loading;

  const handleSubmit = async () => {
    try {
      setError(null);

      const values = form.getValues();
      await request(values);

      onSuccess(values.email);
    } catch {
      setError(ui.ERRORS.GENERIC);
    }
  };

  return (
    <div className="mx-auto max-w-md bg-background text-center">
      <AuthLogo />

      <div className="mb-6 mt-2" />

      <h1 className="text-xl font-semibold">{ui.TITLE}</h1>

      <p className="mt-2 text-sm text-muted-foreground">{ui.DESCRIPTION}</p>

      <div className="mt-6">
        <Form {...form}>
          <form
            className="space-y-4 text-left"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ui.FORM.EMAIL_LABEL}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={ui.FORM.EMAIL_PLACEHOLDER}
                      autoComplete="email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              className="w-full"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircleIcon
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {ui.ACTIONS.SENDING}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {ui.ACTIONS.SEND_LINK}
                </span>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
            >
              <ArrowLeft />
              {ui.ACTIONS.BACK_TO_LOGIN}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
