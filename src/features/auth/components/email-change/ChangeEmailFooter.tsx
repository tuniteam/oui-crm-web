import { LoaderCircleIcon, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TruncatedButtonLabel } from '@/components/shared/TruncatedButtonLabel';
import { EMAIL_CHANGE } from '../../constants/email-change.constants';
import type { EmailChangeHooks } from '../../hooks/useEmailChangeForm';

type Props = {
  hooks: EmailChangeHooks;
  onClose: () => void;
};

const L = EMAIL_CHANGE.REQUEST;

export function ChangeEmailFooter({ hooks, onClose }: Props) {
  const { form, submit, request, sent } = hooks;
  const isBusy = request.loading;

  if (sent) {
    return (
      <div className="flex w-full justify-end">
        <Button className="min-w-0" onClick={onClose}>
          <X className="mr-2 h-4 w-4 shrink-0" />
          <TruncatedButtonLabel label={L.BUTTONS.CLOSE} />
        </Button>
      </div>
    );
  }

  const disabled = isBusy || !form.formState.isValid;

  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        variant="outline"
        className="min-w-0"
        onClick={onClose}
        disabled={isBusy}
      >
        <X className="mr-2 h-4 w-4 shrink-0" />
        <TruncatedButtonLabel label={L.BUTTONS.CANCEL} />
      </Button>

      <Button className="min-w-0" onClick={submit} disabled={disabled}>
        {isBusy ? (
          <>
            <LoaderCircleIcon className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            <TruncatedButtonLabel label={L.LOADING} />
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4 shrink-0" />
            <TruncatedButtonLabel label={L.BUTTONS.CONFIRM} />
          </>
        )}
      </Button>
    </div>
  );
}
