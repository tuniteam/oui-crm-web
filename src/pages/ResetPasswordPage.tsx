import { useMemo, useState } from 'react';
import { ActivationLoadingSkeleton } from '@/features/auth/components/activation-token/skeleton/ActivationLoadingSkeleton';
import { InvalidResetPasswordToken } from '@/features/auth/components/reset-password/InvalidResetPasswordToken';
import { PasswordChanged } from '@/features/auth/components/reset-password/PasswordChanged';
import { ResetPassword } from '@/features/auth/components/reset-password/ResetPassword';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';
import { useValidateResetPasswordToken } from '@/features/auth/hooks/useValidateResetPasswordToken';
import { useNavigate, useSearchParams } from 'react-router-dom';

type ResetState = 'form' | 'success' | 'expired' | 'invalid';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token'), [params]);
  const { state } = useValidateResetPasswordToken(token);

  const [view, setView] = useState<ResetState>('form');
  let body = null;

  if (view === 'success') {
    body = <PasswordChanged />;
  } else if (view === 'expired') {
    body = (
      <InvalidResetPasswordToken
        variant="expired"
        onNewRequest={() => navigate(AUTH_ROUTES.RESET_PASSWORD)}
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN)}
      />
    );
  } else if (view === 'invalid') {
    body = (
      <InvalidResetPasswordToken
        variant="invalid"
        onNewRequest={() => navigate(AUTH_ROUTES.RESET_PASSWORD)}
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN)}
      />
    );
  } else if (state === 'loading') {
    body = <ActivationLoadingSkeleton />;
  } else if (state === 'expired') {
    body = (
      <InvalidResetPasswordToken
        variant="expired"
        onNewRequest={() => navigate(AUTH_ROUTES.RESET_PASSWORD)}
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN)}
      />
    );
  } else if (state === 'invalid') {
    body = (
      <InvalidResetPasswordToken
        variant="invalid"
        onNewRequest={() => navigate(AUTH_ROUTES.RESET_PASSWORD)}
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN)}
      />
    );
  } else {
    body = (
      <ResetPassword
        token={token as string}
        onSuccess={() => setView('success')}
        onExpired={() => setView('expired')}
        onInvalid={() => setView('invalid')}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-md">{body}</div>
    </div>
  );
}
