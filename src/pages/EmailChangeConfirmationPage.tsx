// src/pages/EmailChangeConfirmationPage.tsx
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmailChangeResult } from '@/features/auth/components/email-change/EmailChangeResult';
import { useConfirmEmailChange } from '@/features/auth/hooks/useConfirmEmailChange';

export default function EmailChangeConfirmationPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token'), [params]);

  const { state, email, errorCode } = useConfirmEmailChange(token);

  return (
    <div className="min-h-screen w-full bg-muted/40 grid place-items-center p-4">
      <div className="w-full max-w-md">
        <EmailChangeResult state={state} email={email} errorCode={errorCode} />
      </div>
    </div>
  );
}
