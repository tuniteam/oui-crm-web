import { ReusableWindow } from '@/components/window/ReusableWindow';
import { EMAIL_CHANGE } from '../../constants/email-change.constants';
import {
  useEmailChangeForm,
  type EmailChangeHooks,
} from '../../hooks/useEmailChangeForm';
import { ChangeEmailBody } from './ChangeEmailBody';
import { ChangeEmailFooter } from './ChangeEmailFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeEmailWindow({ open, onOpenChange }: Props) {
  return (
    <ReusableWindow<EmailChangeHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={EMAIL_CHANGE.REQUEST.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => useEmailChangeForm()}
      preventClose
      onClosed={({ reset }) => reset()}
      renderBody={(hooks) => <ChangeEmailBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <ChangeEmailFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
        />
      )}
    />
  );
}
