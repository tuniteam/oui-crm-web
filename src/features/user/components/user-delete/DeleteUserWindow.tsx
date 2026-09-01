// src/features/user/components/user-delete/DeleteUserWindow.tsx
import { ReusableWindow } from '@/components/window/ReusableWindow';
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

export function DeleteUserWindow({
  open,
  onOpenChange,
  userId,
  onDeleted,
  title,
  useDeleteHook,
}: Props) {
  const content = useContent();
  return (
    <ReusableWindow<Record<string, never>>
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
