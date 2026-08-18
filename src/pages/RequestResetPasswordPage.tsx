import { useState } from 'react';
import { RequestResetPassword } from '@/features/auth/components/reset-password/RequestResetPassword';
import { RequestResetPasswordSucceed } from '@/features/auth/components/reset-password/RequestResetPasswordSucceed';
import { AUTH_ROUTES } from '@/features/auth/constants/routes.constants';
import { useNavigate } from 'react-router-dom';

export default function RequestResetPasswordPage() {
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const navigate = useNavigate();

  if (emailSent) {
    return (
      <RequestResetPasswordSucceed
        onBackToLogin={() => navigate(AUTH_ROUTES.LOGIN, { replace: true })}
      />
    );
  }

  return <RequestResetPassword onSuccess={(email) => setEmailSent(email)} />;
}
