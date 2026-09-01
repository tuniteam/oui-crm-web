import { ReusableSheet } from '@/components/drawer/ReusableSheet';
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
    <ReusableSheet<CreateBackofficeUserHooks>
      open={open}
      onOpenChange={onOpenChange}
      title={CREATE_SHEET.TITLE}
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
