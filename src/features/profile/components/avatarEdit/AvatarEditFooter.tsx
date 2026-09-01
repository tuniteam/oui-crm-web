import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AVATAR_EDIT_WINDOW } from '../../constants/avatar-edit.constants';
import type { AvatarEditHooks } from '../../hooks/useAvatarEdit';

type Props = {
  hooks: AvatarEditHooks;
};

export function AvatarEditFooter({ hooks }: Props) {
  const { canSave, isSaving, handleCancel, handleSave } = hooks;

  return (
    <div className="flex w-full justify-end gap-2">
      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
        <X className="mr-2 h-4 w-4" />
        {AVATAR_EDIT_WINDOW.BUTTONS.CANCEL}
      </Button>

      <Button onClick={handleSave} disabled={!canSave || isSaving}>
        {isSaving ? (
          <>
            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
            {AVATAR_EDIT_WINDOW.LOADING_LABELS.SAVING}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {AVATAR_EDIT_WINDOW.BUTTONS.SAVE}
          </>
        )}
      </Button>
    </div>
  );
}
