// src/features/user/components/user-delete/DeleteUserSheet.tsx
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { DeleteUserBody } from './DeleteUserBody';
import { DeleteUserFooter } from './DeleteUserFooter';
import { useContent } from '@/hooks/useContent';
import { useDeleteUser } from '../../hooks/useDeleteUser';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onDeleted: () => void;
  title?: string;
  useDeleteHook?: () => ReturnType<typeof useDeleteUser>;
};

export function DeleteUserSheet({
  open,
  onOpenChange,
  userId,
  onDeleted,
  title,
  useDeleteHook,
}: Props) {
  const content = useContent();
  return (
    <ReusableSheet<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? content.user.delete.sheet.TITLE}
      useHooks={() => ({})}
      preventClose
      renderBody={() => <DeleteUserBody />}
      renderFooter={() => (
        <DeleteUserFooter
          userId={userId}
          onCloseSheet={() => onOpenChange(false)}
          onDeleted={onDeleted}
          useDeleteHook={useDeleteHook}
        />
      )}
    />
  );
}
