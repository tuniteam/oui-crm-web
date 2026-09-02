import { ReusableWindow } from '@/components/window/ReusableWindow';
import { CREATE_USER_WINDOW } from '../constants/users.constants';
import { useCreateUserForm } from '../hooks/useCreateUserForm';
import { CreateUserBody, CreateUserHooks } from './CreateUserBody';
import { CreateUserFooter } from './CreateUserFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

/**
 * Trois props d'injection (`hooksFactory`, `rolesFilter`, `title`) ont ete
 * retirees avec celles de `UsersTable` : aucun appelant ne les renseignait, et
 * `hooksFactory` rendait l'appel de hook conditionnel.
 */
export function CreateUserWindow({ open, onOpenChange, onCreated }: Props) {
  return (
    <ReusableWindow<CreateUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={CREATE_USER_WINDOW.TITLE}
      useHooks={useCreateUserForm}
      preventClose
      onClosed={({ form }) => {
        form.reset();
      }}
      renderBody={(hooks) => <CreateUserBody hooks={hooks} open={open} />}
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
