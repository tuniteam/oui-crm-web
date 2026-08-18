// src/features/auth/components/CreatePassword.tsx
import { useState } from 'react';
import { Check, LoaderCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useActivateAccount } from '../../hooks/useActivateAccount';
import { useCreatePasswordForm } from '../../hooks/useCreatePasswordForm';
import { AuthLogo } from '../AuthLogo';
import { InvalidToken } from './InvalidToken';
import { PasswordValidators } from './PasswordValidators';

type Props = {
  token: string;
  onActivated: (data: { email: string; password: string }) => void;
};

type ActivationError = 'expired' | 'invalid' | 'unknown' | null;

export function CreatePassword({ token, onActivated }: Props) {
  const content = useContent();
  const ui = content.activation.CREATE_PASSWORD;

  const { form } = useCreatePasswordForm();
  const activate = useActivateAccount();
  const navigate = useNavigate();

  const [activationError, setActivationError] = useState<ActivationError>(null);

  const isBusy = activate.loading;
  const canSubmit = form.formState.isValid && !isBusy;
  const passwordValue = form.watch('password') ?? '';

  const handleSubmit = async () => {
    const values = form.getValues();
    setActivationError(null);

    const result = await activate.activate({
      token,
      password: values.password,
    });

    if (result.ok) {
      onActivated({ email: result.data.email, password: values.password });
      return;
    }

    const err = result.error as {
      response?: { data?: { messages?: { code?: string } } };
    };
    const code = err?.response?.data?.messages?.code;
    if (code === 'ACTIVATION_TOKEN_EXPIRED') {
      setActivationError('expired');
      return;
    }

    if (code === 'ACTIVATION_TOKEN_INVALID') {
      setActivationError('invalid');
      return;
    }

    setActivationError('unknown');
  };

  if (activationError === 'expired' || activationError === 'invalid') {
    return (
      <InvalidToken
        variant={activationError}
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border bg-background p-6">
      <AuthLogo />

      <h1 className="text-xl font-semibold text-center">{ui.TITLE}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {ui.SUBTITLE}
      </p>

      {activationError === 'unknown' ? (
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
                  <FormLabel>{ui.LABELS.PASSWORD}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={ui.PLACEHOLDERS.PASSWORD}
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ui.LABELS.CONFIRM_PASSWORD}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={ui.PLACEHOLDERS.CONFIRM_PASSWORD}
                      disabled={isBusy}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PasswordValidators password={passwordValue} />

            <div className="space-y-3 pt-2">
              <FormField
                control={form.control}
                name="acceptCgu"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                          disabled={isBusy}
                        />
                      </FormControl>
                      <div className="leading-tight">
                        <div className="text-sm">{ui.LABELS.CGU}</div>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptRgpd"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                          disabled={isBusy}
                        />
                      </FormControl>
                      <div className="leading-tight">
                        <div className="text-sm">{ui.LABELS.RGPD}</div>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              className="mt-2 w-full"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isBusy ? (
                <span className="flex items-center justify-center gap-2">
                  <LoaderCircleIcon
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  {ui.BUTTONS.SUBMIT_LOADING}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  {ui.BUTTONS.SUBMIT}
                </span>
              )}
            </Button>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              {ui.FOOTER}
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
