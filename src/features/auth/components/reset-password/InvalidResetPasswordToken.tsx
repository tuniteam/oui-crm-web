import { AlertTriangle, ArrowLeft, RotateCw } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '../AuthLogo';

type Props = {
  variant: 'invalid' | 'expired';
  onBackToLogin: () => void;
  onNewRequest: () => void;
};

export function InvalidResetPasswordToken({
  variant,
  onBackToLogin,
  onNewRequest,
}: Props) {
  const content = useContent();
  const ui = content.resetPassword.INVALID_TOKEN;

  const title = variant === 'expired' ? ui.TITLE.EXPIRED : ui.TITLE.INVALID;

  const description =
    variant === 'expired' ? ui.DESCRIPTION.EXPIRED : ui.DESCRIPTION.INVALID;

  return (
    <div className="mx-auto max-w-md bg-background text-center">
      <AuthLogo />

      <div />

      <div className="flex justify-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>

      <h1 className="text-2xl font-semibold">{title}</h1>

      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-5 rounded-md border bg-muted px-4 py-3 text-left text-sm text-muted-foreground">
        <p className="mb-2 font-medium">{ui.WHY.TITLE}</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>{ui.WHY.EXPIRES_AFTER}</li>
          <li>{ui.WHY.SINGLE_USE}</li>
        </ul>
      </div>

      <div className="mt-6 space-y-3">
        <Button type="button" className="w-full" onClick={onNewRequest}>
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {ui.ACTIONS.NEW_REQUEST}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBackToLogin}
        >
          <ArrowLeft />
          {ui.ACTIONS.BACK_TO_LOGIN}
        </Button>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">{ui.FOOTER}</p>
    </div>
  );
}
