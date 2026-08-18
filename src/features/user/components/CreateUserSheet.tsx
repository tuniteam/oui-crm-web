import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { CREATE_USER_SHEET } from '../constants/users.constants';
import { useCreateUserForm } from '../hooks/useCreateUserForm';
import { CreateUserBody, CreateUserHooks } from './CreateUserBody';
import { CreateUserFooter } from './CreateUserFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  hooksFactory?: () => CreateUserHooks;
  rolesFilter?: 'true' | 'false';
  title?: string;
};

export function CreateUserSheet({ open, onOpenChange, onCreated, hooksFactory, rolesFilter, title }: Props) {
  return (
    <ReusableSheet<CreateUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? CREATE_USER_SHEET.TITLE}
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHooks={hooksFactory ?? (() => useCreateUserForm())}
      preventClose
      onClosed={({ form }) => {
        form.reset();
      }}
      renderBody={(hooks) => <CreateUserBody hooks={hooks} open={open} rolesFilter={rolesFilter} />}
      renderFooter={(hooks) => (
        <CreateUserFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      )}
    />
  );
}
