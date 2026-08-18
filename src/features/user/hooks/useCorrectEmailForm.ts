import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CORRECT_EMAIL } from '../constants/correct-email.constants';
import { USER_STATUS } from '../constants/userList.constants';
import {
  getCorrectEmailSchema,
  type CorrectEmailSchemaType,
} from '../forms/correct-email-schema';
import type { UserStatus } from '../types/userList';
import { useCorrectUserEmail } from './useCorrectUserEmail';

const E = CORRECT_EMAIL.ERRORS;

/** Codes d'erreur affichés en inline sous le champ (les autres -> toast). */
const INLINE_ERROR_CODES = [
  'EMAIL_UNCHANGED',
  'INVALID_DATA',
  'EMAIL_ALREADY_TAKEN',
];

type SubmitResult = { ok: boolean; close: boolean };

export function useCorrectEmailForm(userId: string, status: UserStatus) {
  const schema = useMemo(() => getCorrectEmailSchema(), []);
  const correct = useCorrectUserEmail(userId);

  const form = useForm<CorrectEmailSchemaType>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (): Promise<SubmitResult> => {
    setErrorMessage(null);

    const valid = await form.trigger();
    if (!valid) return { ok: false, close: false };

    const { email } = form.getValues();
    const res = await correct.correct({ email });

    if (res.ok) {
      toast.success(
        status === USER_STATUS.PENDING
          ? CORRECT_EMAIL.TOASTS.SUCCESS_PENDING(res.email)
          : CORRECT_EMAIL.TOASTS.SUCCESS,
      );
      return { ok: true, close: true };
    }

    const message =
      (res.code && (E as Record<string, string>)[res.code]) || E.UNKNOWN;

    if (res.code && INLINE_ERROR_CODES.includes(res.code)) {
      setErrorMessage(message);
      return { ok: false, close: false };
    }

    toast.error(message);
    return { ok: false, close: true };
  };

  const reset = () => {
    form.reset();
    setErrorMessage(null);
  };

  return { form, loading: correct.loading, submit, reset, errorMessage };
}

export type CorrectEmailHooks = ReturnType<typeof useCorrectEmailForm>;
