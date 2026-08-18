
import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/hooks/useContent';
import type { ChangePasswordHooks } from '../../hooks/useChangePasswordForm';

type Props = {
  hooks: ChangePasswordHooks;
  onClose: () => void;
};

export function ChangePasswordFooter({ hooks, onClose }: Props) {
  const { form, submit, changePassword: mutation } = hooks;
  const { changePassword } = useContent();

  const isBusy = mutation.loading;
  const disabled = isBusy || !form.formState.isValid;

  const handleConfirm = async () => {
    const res = await submit();

    if (res?.success) {
      onClose();
      form.reset();
    }
  };

  return (
    <div className="flex w-full justify-end gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isBusy}
      >
        <X className="mr-2 h-4 w-4" />
        {changePassword.BUTTONS.CANCEL}
      </Button>

      <Button
        onClick={handleConfirm}
        disabled={disabled}
      >
        {isBusy ? (
          <>
            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
            {changePassword.LOADING_LABELS.CONFIRMING}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {changePassword.BUTTONS.CONFIRM}
          </>
        )}
      </Button>
    </div>
  );
}