import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { useContent } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';
import { SheetFooterSkeleton } from '@/components/skeleton/SheetFooterSkeleton';
import type { UpdateProfileHooks } from '../../hooks/useUpdateProfileForm';

type Props = {
  hooks: UpdateProfileHooks;
  onClose: () => void;
};

export function UpdateProfileFooter({ hooks, onClose }: Props) {
  const { form, submit, updateProfile: mutation, profileQuery } = hooks;
  const { updateProfile } = useContent();
  const isLoading = profileQuery.isLoading;
  const isBusy = mutation.loading;
  const disabled = isBusy || !form.formState.isValid;

  const handleConfirm = async () => {
    const res = await submit();

    if (res?.id) {
      onClose();
      form.reset();
    }
  };
  if (isLoading) return <SheetFooterSkeleton />;

  return (
    <div className="flex w-full justify-end gap-2">
      <Button variant="outline" onClick={onClose} disabled={isBusy}>
        <X className="mr-2 h-4 w-4" />
        {updateProfile.BUTTONS.CANCEL}
      </Button>

      <Button onClick={handleConfirm} disabled={disabled}>
        {isBusy ? (
          <>
            <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
            {updateProfile.LOADING_LABELS.SAVING}
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {updateProfile.BUTTONS.SAVE}
          </>
        )}
      </Button>
    </div>
  );
}
