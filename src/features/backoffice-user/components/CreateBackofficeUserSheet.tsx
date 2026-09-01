import { ReusableWindow } from '@/components/window/ReusableWindow';
import { CREATE_SHEET } from '../constants/constants';
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

export function CreateBackofficeUserSheet({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  return (
    <ReusableWindow<CreateBackofficeUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={CREATE_SHEET.TITLE}
      description={CREATE_SHEET.DESCRIPTION}
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
