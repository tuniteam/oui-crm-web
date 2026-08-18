import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CREATE_USER_SHEET } from '../constants/users.constants';
import { CreateUserHooks } from './CreateUserBody';
import { COMMON } from '@/constants';

type Props = {
  hooks: CreateUserHooks;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateUserFooter({ hooks, onClose, onCreated }: Props) {
  const { create, submit } = hooks;
  const isBusy = create.loading;

  const handleCreate = async () => {
    const created = await submit();
    if (created) {
      onClose();
      onCreated?.();
    }
  };

  return (
    <div className="flex w-full justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
        <X aria-hidden="true" />
        {COMMON.ACTIONS.CANCEL}
      </Button>

      <Button type="button" onClick={handleCreate} disabled={isBusy}>
        {create.loading ? (
          <span className="flex items-center gap-2">
            <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            {CREATE_USER_SHEET.LOADING_LABELS.CREATING}
          </span>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            {COMMON.ACTIONS.CREATE}
          </>
        )}
      </Button>
    </div>
  );
}
