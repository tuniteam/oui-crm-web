import { LoaderCircleIcon, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteUser } from '@/features/user/hooks/useDeleteUser';
import { useContent } from '@/hooks/useContent';

type Props = {
  userId: string;
  onCloseSheet: () => void;
  onDeleted: () => void;
  useDeleteHook?: () => ReturnType<typeof useDeleteUser>;
};

export function DeleteUserFooter({ userId, onCloseSheet, onDeleted, useDeleteHook }: Props) {
  const content = useContent();
  const deleteMutation = (useDeleteHook ?? useDeleteUser)();

  const handleDelete = () => {
    deleteMutation.mutate(
      { userId },
      {
        onSuccess: () => {
          onCloseSheet();
          onDeleted();
        },
      },
    );
  };

  return (
    <div className="flex w-full justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCloseSheet}
        disabled={deleteMutation.isPending}
      >
        <X />
        {content.common.ACTIONS.CANCEL}
      </Button>

      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? (
          <span className="flex items-center gap-2">
            <LoaderCircleIcon className="h-4 w-4 animate-spin" />
            {content.common.ACTIONS.DELETING}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Trash2 />
            {content.common.ACTIONS.DELETE}
          </span>
        )}
      </Button>
    </div>
  );
}
