import { ArrowLeft, Mail } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { AuthLogo } from '../AuthLogo';

type Props = {
  onBackToLogin: () => void;
};

export function RequestResetPasswordSucceed({ onBackToLogin }: Props) {
  const content = useContent();
  const ui = content.resetPassword.REQUEST_SUCCESS;

  return (
    <div className="mx-auto max-w-md bg-background text-center">
      <AuthLogo />

      <div className="mb-6" />

      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-muted">
          <Mail className="h-7 w-7 text-muted-foreground" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold">{ui.TITLE}</h1>

      <p className="mt-3 text-sm text-muted-foreground">{ui.DESCRIPTION}</p>

      <div className="mt-5 rounded-md border bg-muted px-4 py-3 text-left text-sm text-muted-foreground">
        <p>{ui.INFO.SPAM}</p>
        <p className="mt-2">{ui.INFO.EXPIRES}</p>
      </div>

      <div className="mt-6 space-y-3">
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
    </div>
  );
}
