import { LoaderCircleIcon, Save, X } from 'lucide-react';
import { COMMON } from '@/constants';
import { Button } from '@/components/ui/button';
import type { CreateBackofficeUserHooks } from '../hooks/useCreateBackofficeUserForm';

type Props = {
  hooks: CreateBackofficeUserHooks;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateBackofficeUserFooter({
  hooks,
  onClose,
  onCreated,
}: Props) {
  const { submit, loading } = hooks;

  const handleCreate = async () => {
    const created = await submit();
    if (created) {
      onClose();
      onCreated?.();
    }
  };

  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={loading}
      >
        <X aria-hidden="true" />
        {COMMON.ACTIONS.CANCEL}
      </Button>

      <Button
        type="button"
        onClick={handleCreate}
        disabled={loading}
        data-testid="backoffice-user-create-submit"
      >
        {loading ? (
          <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Save className="h-4 w-4" aria-hidden="true" />
        )}
        {COMMON.ACTIONS.CREATE}
      </Button>
    </div>
  );
}
