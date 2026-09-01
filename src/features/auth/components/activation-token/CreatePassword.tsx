// src/features/auth/components/CreatePassword.tsx
import { useState } from 'react';
import { Check, LoaderCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
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
import type { ActivationValidateResponse } from '../../types/auth';
import { AUTH_ROUTES } from '../../constants/routes.constants';
import { useActivateAccount } from '../../hooks/useActivateAccount';
import { useCreatePasswordForm } from '../../hooks/useCreatePasswordForm';
import { AuthLogo } from '../AuthLogo';
import { InvalidToken } from './InvalidToken';
import { PasswordValidators } from './PasswordValidators';

type Props = {
  token: string;
  /** Identite et documents legaux rendus par validate ; null tant qu'absents. */
  account: ActivationValidateResponse | null;
  /** L'activation a ouvert la session : plus rien a re-saisir. */
  onActivated: () => void;
};

type ActivationError = 'expired' | 'invalid' | null;

export function CreatePassword({ token, account, onActivated }: Props) {
  const content = useContent();
  const ui = content.activation.CREATE_PASSWORD;

  const { form } = useCreatePasswordForm();
  const activate = useActivateAccount();
  const navigate = useNavigate();

  const [activationError, setActivationError] = useState<ActivationError>(null);
  /** Message serveur des refus metier (consentement, politique de mot de passe). */
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isBusy = activate.loading;
  const canSubmit = form.formState.isValid && !isBusy;
  const passwordValue = form.watch('password') ?? '';

  const handleSubmit = async () => {
    const values = form.getValues();
    setActivationError(null);
    setSubmitError(null);

    // Les deux consentements font partie du contrat : sans eux le serveur
    // repond 400 LEGAL_CONSENT_REQUIRED. Le schema les impose deja a `true`.
    const result = await activate.activate({
      token,
      password: values.password,
      acceptCgu: values.acceptCgu,
      acceptRgpd: values.acceptRgpd,
    });

    if (result.ok) {
      onActivated();
      return;
    }

    const code = getApiErrorCode(result.error);
    if (code === 'ACTIVATION_TOKEN_EXPIRED') {
      setActivationError('expired');
      return;
    }

    if (code === 'ACTIVATION_TOKEN_INVALID') {
      setActivationError('invalid');
      return;
    }

    // Mot de passe refuse, consentement manquant, panne : on montre le message
    // du serveur plutot qu'un « erreur inconnue » qui ne dit rien.
    setSubmitError(getApiErrorMessage(result.error));
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

      {submitError ? (
        <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      {account ? (
        <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
          <div className="text-xs font-medium uppercase text-muted-foreground">
            {ui.IDENTITY_TITLE}
          </div>
          <div className="mt-1 font-medium">
            {account.firstName} {account.lastName}
          </div>
          <div className="text-muted-foreground">{account.email}</div>
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

            {account && account.legalDocuments.length > 0 ? (
              <div className="pt-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">
                  {ui.LEGAL_TITLE}
                </div>
                {/* La liste vient du serveur (code + version) : ne jamais la
                    coder en dur, elle evolue avec les versions publiees. */}
                <ul className="mt-2 space-y-1">
                  {account.legalDocuments.map((doc) => (
                    <li key={`${doc.code}-${doc.version}`}>
                      <a
                        className="text-sm text-primary underline underline-offset-2"
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`${doc.code} (v${doc.version})`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
