
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { ChangePasswordBody } from './ChangePasswordBody';
import { ChangePasswordFooter } from './ChangePasswordFooter';
import {
  useChangePasswordForm,
  ChangePasswordHooks,
} from '../../hooks/useChangePasswordForm';
import { useContent } from '@/hooks/useContent';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordWindow({ open, onOpenChange }: Props) {
  const { changePassword } = useContent();

  return (
    <ReusableWindow<ChangePasswordHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={changePassword.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={() => useChangePasswordForm()}
      preventClose
      onClosed={({ form }) => form.reset()}
      renderBody={(hooks) => <ChangePasswordBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <ChangePasswordFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
        />
      )}
    />
  );
}