// src/pages/UserActivationPage.tsx
import { useMemo, useState } from 'react';
import { ContinueAfterActivation } from '@/features/auth/components/activation-token/ContinueAfterActivation';
import { CreatePassword } from '@/features/auth/components/activation-token/CreatePassword';
import { InvalidToken } from '@/features/auth/components/activation-token/InvalidToken';
import { ActivationLoadingSkeleton } from '@/features/auth/components/activation-token/skeleton/ActivationLoadingSkeleton';
import { useValidateToken } from '@/features/auth/hooks/useValidateToken';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';

export default function UserActivationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token'), [params]);
  const { state, account } = useValidateToken(token);

  const [activated, setActivated] = useState(false);

  const backToLogin = () => navigate(AUTH_ROUTES.LOGIN, { replace: true });

  let body = null;

  if (activated) {
    body = <ContinueAfterActivation />;
  } else if (state === 'loading') {
    body = <ActivationLoadingSkeleton />;
  } else if (state === 'expired') {
    body = <InvalidToken variant="expired" onBackToLogin={backToLogin} />;
  } else if (state === 'invalid') {
    body = <InvalidToken variant="invalid" onBackToLogin={backToLogin} />;
  } else {
    body = (
      <CreatePassword
        token={token as string}
        account={account}
        onActivated={() => setActivated(true)}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-muted/40 grid place-items-center p-4">
      <div className="w-full max-w-md">{body}</div>
    </div>
  );
}
