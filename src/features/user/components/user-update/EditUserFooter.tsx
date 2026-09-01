import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditUserHooks } from '../../hooks/useEditUserForm';
import { UPDATE_USER_WINDOW } from '../../constants/editUser.constants';
import { SheetFooterSkeleton } from '@/components/skeleton/SheetFooterSkeleton';

type Props = {
  hooks: EditUserHooks;
  onClose: () => void;
};

export function EditUserFooter({ hooks, onClose }: Props) {
  const { update, submit, loadingUser, fetchingUser } = hooks;
  const isBusy = update.loading;

  const handleSave = async () => {
    const updated = await submit();
    if (updated) onClose();
  };

  if (loadingUser || fetchingUser) {
    return (
      <SheetFooterSkeleton />
    );
  }

  return (
    <div className="flex w-full justify-end gap-2">
      <Button
        data-testid="user-edit-cancel-btn"
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isBusy}
      >
        <X />
        {UPDATE_USER_WINDOW.ACTIONS.CANCEL}
      </Button>

      <Button
        data-testid="user-edit-save-btn"
        type="button"
        onClick={handleSave}
        disabled={isBusy}
      >
        {isBusy ? (
          <span className="flex items-center gap-2">
            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            {UPDATE_USER_WINDOW.LOADING_LABELS.SAVING}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save />
            {UPDATE_USER_WINDOW.ACTIONS.SAVE}
          </span>
        )}
      </Button>
    </div>
  );
}
