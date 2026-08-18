import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBackdrop,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AVATAR_EDIT_SHEET } from '../../constants/avatar-edit.constants';
import { useAvatarEdit } from '../../hooks/useAvatarEdit';
import { AvatarEditBody } from './AvatarEditBody';
import { AvatarEditFooter } from './AvatarEditFooter';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAvatarUrl: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export function AvatarEditSheet({
  open,
  onOpenChange,
  initialAvatarUrl,
  firstName,
  lastName,
}: Props) {
  const hooks = useAvatarEdit({
    initialAvatarUrl,
    onClose: () => onOpenChange(false),
  });

  useEffect(() => {
    if (!open) {
      hooks.resetState();
    }
    // resetState is stable; we intentionally only react to open changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      {open && (
        <SheetBackdrop onClick={() => hooks.handleCancel()} />
      )}
      <SheetContent
        overlay={false}
        className="sm:w-[50%] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 **:data-[slot=sheet-close]:top-4.5 **:data-[slot=sheet-close]:end-5"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <SheetTitle className="truncate">{AVATAR_EDIT_SHEET.TITLE}</SheetTitle>
        </SheetHeader>

        <SheetBody className="px-5 py-0">
          <ScrollArea className="h-[calc(100dvh-11.75rem)] pe-3 -me-3 px-1">
            <div className="px-1">
              <AvatarEditBody
                hooks={hooks}
                firstName={firstName}
                lastName={lastName}
              />
            </div>
          </ScrollArea>
        </SheetBody>

        <SheetFooter className="border-t py-3.5 px-5 border-border">
          <AvatarEditFooter hooks={hooks} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
