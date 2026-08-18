import { useEffect, useRef, useState } from 'react';
import { getApiErrorCode } from '@/shared/utils/api-error';
import { emailChangeService } from '../services/email-change.service';

export type EmailChangeConfirmState = 'loading' | 'success' | 'error';

/**
 * Auto-confirms the email change on mount by POSTing the token.
 * useRef guard prevents the double-invocation under React StrictMode.
 */
export function useConfirmEmailChange(token: string | null) {
  const ranRef = useRef(false);
  const [state, setState] = useState<EmailChangeConfirmState>('loading');
  const [email, setEmail] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!token) {
      setErrorCode('EMAIL_CHANGE_TOKEN_REQUIRED');
      setState('error');
      return;
    }

    emailChangeService
      .confirmChange({ token })
      .then((res) => {
        setEmail(res.email);
        setState('success');
      })
      .catch((err) => {
        setErrorCode(getApiErrorCode(err));
        setState('error');
      });
  }, [token]);

  return { state, email, errorCode };
}
