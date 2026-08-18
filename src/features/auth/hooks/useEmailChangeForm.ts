import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EMAIL_CHANGE } from '../constants/email-change.constants';
import {
  getEmailChangeSchema,
  type EmailChangeSchemaType,
} from '../forms/email-change-schema';
import { useRequestEmailChange } from './useRequestEmailChange';

const E = EMAIL_CHANGE.REQUEST.ERRORS;

export function useEmailChangeForm() {
  const schema = useMemo(() => getEmailChangeSchema(), []);
  const request = useRequestEmailChange();

  const form = useForm<EmailChangeSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      newEmail: '',
      currentPassword: '',
    },
  });

  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async () => {
    setErrorMessage(null);

    const ok = await form.trigger();
    if (!ok) return;

    const values = form.getValues();
    const res = await request.request({
      newEmail: values.newEmail,
      currentPassword: values.currentPassword,
    });

    if (res.ok) {
      setSentEmail(values.newEmail);
      setSent(true);
      return;
    }

    const mapped = res.code && (E as Record<string, string>)[res.code];
    setErrorMessage(mapped ?? E.UNKNOWN);
  };

  const reset = () => {
    form.reset();
    setSent(false);
    setSentEmail('');
    setErrorMessage(null);
  };

  return { form, request, submit, reset, sent, sentEmail, errorMessage };
}

export type EmailChangeHooks = ReturnType<typeof useEmailChangeForm>;
