import { ReusableWindow } from '@/components/window/ReusableWindow';
import { AVATAR_EDIT_WINDOW } from '../../constants/avatar-edit.constants';
import { useAvatarEdit } from '../../hooks/useAvatarEdit';
import { AvatarEditBody } from './AvatarEditBody';
import { AvatarEditFooter } from './AvatarEditFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAvatarUrl: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export function AvatarEditWindow({
  open,
  onOpenChange,
  initialAvatarUrl,
  firstName,
  lastName,
}: Props) {
  return (
    <ReusableWindow<ReturnType<typeof useAvatarEdit>>
      open={open}
      onOpenChange={onOpenChange}
      title={AVATAR_EDIT_WINDOW.TITLE}
      useHooks={() =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useAvatarEdit({ initialAvatarUrl, onClose: () => onOpenChange(false) })
      }
      preventClose
      onClosed={(hooks) => hooks.resetState()}
      renderBody={(hooks) => (
        <AvatarEditBody
          hooks={hooks}
          firstName={firstName}
          lastName={lastName}
        />
      )}
      renderFooter={(hooks) => <AvatarEditFooter hooks={hooks} />}
    />
  );
}
