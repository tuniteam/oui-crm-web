// components/window/ReusableWindow.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
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
  /** Surcharge du dimensionnement. Par défaut : large, presque pleine hauteur. */
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
        className={cn(
          // p-0 et max-w-none neutralisent les valeurs par defaut de la
          // variante (p-6, max-w-lg) qui bridaient la fenetre.
          'p-0 gap-0 flex flex-col rounded-lg max-w-none overflow-hidden',
          // Mobile : pleine hauteur utile, marge de 12px. 100dvh et non 100vh,
          // sinon la barre d'adresse mobile rogne le pied de page.
          'w-[calc(100%-1.5rem)] h-[calc(100dvh-1.5rem)]',
          // A partir de sm : la fenetre s'adapte au contenu mais peut monter
          // jusqu'a presque toute la hauteur.
          'sm:w-full sm:max-w-4xl sm:h-auto sm:max-h-[calc(100dvh-3rem)]',
          className,
        )}
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle className="truncate">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {/*
         * Le corps est lui-meme la zone defilante.
         *
         * `min-h-0` est indispensable : sans lui, un enfant flex refuse de
         * retrecir sous sa taille de contenu et le defilement ne prend pas.
         *
         * On n'imbrique pas de ScrollArea ici : sa hauteur `h-full` est un
         * pourcentage, et un pourcentage ne resout rien quand le parent tire sa
         * hauteur du flex (`sm:h-auto` + `sm:max-h-*`) plutot que d'une hauteur
         * explicite. La zone grandissait donc avec le contenu et passait sous
         * le pied de fenetre.
         */}
        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-4 py-0 sm:px-6">
          <div className="px-1 py-5">{renderBody(hooks)}</div>
        </DialogBody>

        {renderFooter ? (
          <DialogFooter className="shrink-0 border-t border-border px-4 py-4 pt-4 sm:px-6">
            {renderFooter(hooks)}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
