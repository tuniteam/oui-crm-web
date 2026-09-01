import { ReusableWindow } from '@/components/window/ReusableWindow';
import { CREATE_WINDOW } from '../constants/constants';
import {
  useCreateBackofficeUserForm,
  type CreateBackofficeUserHooks,
} from '../hooks/useCreateBackofficeUserForm';
import { CreateBackofficeUserBody } from './CreateBackofficeUserBody';
import { CreateBackofficeUserFooter } from './CreateBackofficeUserFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
};

export function CreateBackofficeUserWindow({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  return (
    <ReusableWindow<CreateBackofficeUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={CREATE_WINDOW.TITLE}
      description={CREATE_WINDOW.DESCRIPTION}
      useHooks={useCreateBackofficeUserForm}
      preventClose
      onClosed={({ form }) => form.reset()}
      renderBody={(hooks) => <CreateBackofficeUserBody hooks={hooks} />}
      renderFooter={(hooks) => (
        <CreateBackofficeUserFooter
          hooks={hooks}
          onClose={() => onOpenChange(false)}
          onCreated={onCreated}
        />
      )}
    />
  );
}
