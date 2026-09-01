// components/window/ReusableWindow.tsx
import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ReusableWindowProps<THooks> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;
  /** Sous-titre facultatif, sous le titre. */
  description?: React.ReactNode;

  /** Hook générique */
  useHooks: () => THooks;

  /** Slots (render props) */
  renderBody: (hooks: THooks) => React.ReactNode;
  renderFooter?: (hooks: THooks) => React.ReactNode;

  /** Options */
  preventClose?: boolean;
  onClosed?: (hooks: THooks) => void;
  /** Largeur maximale. Par défaut large, adaptée aux formulaires denses. */
  className?: string;
};

/**
 * Fenêtre modale centrée — le conteneur standard des formulaires de oui-crm.
 *
 * Même API que l'ancien ReusableSheet (open, useHooks, renderBody,
 * renderFooter, preventClose, onClosed) pour que la bascule soit mécanique.
 * Le corps défile de façon autonome : l'en-tête et le pied restent visibles,
 * ce qui compte pour des formulaires longs comme la matrice des droits.
 */
export function ReusableWindow<THooks>({
  open,
  onOpenChange,
  title,
  description,
  useHooks,
  renderBody,
  renderFooter,
  preventClose = true,
  onClosed,
  className,
}: ReusableWindowProps<THooks>) {
  const hooks = useHooks();

  React.useEffect(() => {
    if (!open) onClosed?.(hooks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          className ??
          'sm:max-w-4xl w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)] p-0 gap-0 flex flex-col'
        }
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        <DialogHeader className="border-b py-4 px-6 border-border">
          <DialogTitle className="truncate">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogBody className="flex-1 min-h-0 px-6 py-0">
          <ScrollArea className="h-full max-h-[60vh] pe-3 -me-3 px-1">
            <div className="px-1 py-5">{renderBody(hooks)}</div>
          </ScrollArea>
        </DialogBody>

        {renderFooter ? (
          <DialogFooter className="border-t py-4 px-6 border-border">
            {renderFooter(hooks)}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
