import { Check, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '../../constants/routes.constants';
import { AuthLogo } from '../AuthLogo';

export function PasswordChanged() {
  const navigate = useNavigate();
  const content = useContent();
  const ui = content.resetPassword.PASSWORD_CHANGED;

  return (
    <div className="mx-auto max-w-md bg-background text-center">
      <AuthLogo />

      <div className="mb-6" />

      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Check className="h-8 w-8 text-foreground" />
        </div>
      </div>

      <h1 className="text-2xl font-semibold">{ui.TITLE}</h1>

      <p className="mt-2 text-sm text-muted-foreground">{ui.DESCRIPTION}</p>

      <Button
        type="button"
        className="mt-6 w-full"
        onClick={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {ui.ACTIONS.LOGIN}
      </Button>
    </div>
  );
}
