// components/sheets/ReusableSheet.tsx
import * as React from 'react';
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

type ReusableSheetProps<THooks> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;

  /** Hook générique */
  useHooks: () => THooks;

  /** Slots (render props) */
  renderBody: (hooks: THooks) => React.ReactNode;
  renderFooter?: (hooks: THooks) => React.ReactNode;

  /** Options */
  preventClose?: boolean;
  onClosed?: (hooks: THooks) => void;
};

export function ReusableSheet<THooks>({
  open,
  onOpenChange,
  title,
  useHooks,
  renderBody,
    renderFooter,
  preventClose = true,
  onClosed,
}: ReusableSheetProps<THooks>) {
  const hooks = useHooks();

  React.useEffect(() => {
    if (!open) onClosed?.(hooks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      {open && (
        <SheetBackdrop
          onClick={() => { if (!preventClose) onOpenChange(false); }}
        />
      )}
      <SheetContent
        overlay={false}
        className={
          'sm:w-[50%] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5'
        }
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        <SheetHeader className="border-b py-3.5 px-5 border-border">
          <div className="flex flex-col gap-2">
            <SheetTitle className="truncate">{title}</SheetTitle>
          </div>
        </SheetHeader>

        <SheetBody className="flex-1 min-h-0 px-5 py-0">
          <ScrollArea className={"h-full pe-3 -me-3 px-1"}>
            <div className="px-1">{renderBody(hooks)}</div>
          </ScrollArea>
        </SheetBody>

        {renderFooter ? (
          <SheetFooter className="border-t py-3.5 px-5 border-border">
            {renderFooter(hooks)}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
