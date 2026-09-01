// src/features/users/components/EditUserWindow.tsx
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { EditUserBody } from './EditUserBody';
import { EditUserFooter } from './EditUserFooter';
import { EditUserHooks, useEditUserForm } from '../../hooks/useEditUserForm';
import { UPDATE_USER_WINDOW } from '../../constants/editUser.constants';
import { useMeStore } from '@/contexts/useMeStore';


type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  hooksFactory?: (userId: string, isOpen: boolean, email?: string) => EditUserHooks;
  rolesFilter?: 'true' | 'false';
  title?: string;
};

export function EditUserWindow({ open, onOpenChange, userId, hooksFactory, rolesFilter, title }: Props) {
  const { me } = useMeStore();
  const currentUserEmail = me?.email;
  return (
    <ReusableWindow<EditUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? UPDATE_USER_WINDOW.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={hooksFactory ? () => hooksFactory(userId, open, currentUserEmail) : () => useEditUserForm(userId, open, currentUserEmail)}
      preventClose
      onClosed={({ form }) => form.reset()}
      renderBody={(hooks) => <EditUserBody hooks={hooks} open={open} rolesFilter={rolesFilter} />}
      renderFooter={(hooks) => (
        <EditUserFooter hooks={hooks} onClose={() => onOpenChange(false)} />
      )}
    />
  );
}
