import { Check, LoaderCircleIcon, LogIn, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EMAIL_CHANGE } from '../../constants/email-change.constants';
import { AUTH_ROUTES } from '../../constants/routes.constants';
import type { EmailChangeConfirmState } from '../../hooks/useConfirmEmailChange';
import { AuthStatusCard } from '../AuthStatusCard';

type Props = {
  state: EmailChangeConfirmState;
  email: string;
  errorCode: string | null;
};

const C = EMAIL_CHANGE.CONFIRM;

export function EmailChangeResult({ state, email, errorCode }: Props) {
  const navigate = useNavigate();

  if (state === 'loading') {
    return (
      <AuthStatusCard
        icon={
          <LoaderCircleIcon
            className="h-8 w-8 animate-spin"
            aria-hidden="true"
          />
        }
        title={C.LOADING}
      />
    );
  }

  if (state === 'success') {
    return (
      <AuthStatusCard
        icon={<Check className="h-8 w-8" aria-hidden="true" />}
        title={C.SUCCESS.TITLE}
        description={C.SUCCESS.DESCRIPTION(email)}
        actions={
          <Button
            type="button"
            className="w-full"
            onClick={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {C.ACTIONS.LOGIN}
          </Button>
        }
      />
    );
  }

  const errorMessage =
    (errorCode && (C.ERRORS as Record<string, string>)[errorCode]) ||
    C.ERRORS.UNKNOWN;

  return (
    <AuthStatusCard
      variant="destructive"
      icon={<TriangleAlert className="h-8 w-8" aria-hidden="true" />}
      title={C.ERROR_TITLE}
      description={errorMessage}
      actions={
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {C.ACTIONS.LOGIN}
        </Button>
      }
    />
  );
}
