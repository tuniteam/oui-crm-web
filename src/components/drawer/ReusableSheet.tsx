import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetBackdrop,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type ReusableSheetProps<THooks> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;
  /** Sous-titre facultatif, sous le titre. */
  description?: React.ReactNode;
  /** Contenu libre entre le titre et le corps : badges, statuts, compteurs. */
  renderHeaderExtra?: (hooks: THooks) => React.ReactNode;

  /** Hook générique, appelé une fois pour toute la feuille. */
  useHooks: () => THooks;

  /** Slots (render props) */
  renderBody: (hooks: THooks) => React.ReactNode;
  renderFooter?: (hooks: THooks) => React.ReactNode;

  /** Options */
  preventClose?: boolean;
  onClosed?: (hooks: THooks) => void;
  /** Surcharge du dimensionnement. Par défaut : 70 % de l'écran. */
  className?: string;
};

/**
 * Panneau latéral — le conteneur standard des fiches de oui-crm.
 *
 * Même API de slots que `ReusableWindow` (open, useHooks, renderBody,
 * renderFooter, preventClose, onClosed) : passer d'une fenêtre centrée à un
 * panneau reste mécanique, et un écran n'a pas à réapprendre un contrat.
 *
 * Panneau flottant plutôt que collé au bord, comme dans soft-m : `inset-*`
 * détache la feuille, ce qui laisse voir la liste derrière et rend la
 * bordure lisible sur les quatre côtés.
 *
 * `modal={false}` avec un `SheetBackdrop` explicite : le mode modal de Radix
 * verrouille le défilement du document et pose `aria-hidden` sur le reste de
 * la page, ce qui gêne dès qu'on enchaîne les fiches.
 */
export function ReusableSheet<THooks>({
  open,
  onOpenChange,
  title,
  description,
  renderHeaderExtra,
  useHooks,
  renderBody,
  renderFooter,
  preventClose = true,
  onClosed,
  className,
}: ReusableSheetProps<THooks>) {
  const hooks = useHooks();

  React.useEffect(() => {
    if (!open) onClosed?.(hooks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      {open ? (
        <SheetBackdrop
          onClick={() => {
            if (!preventClose) onOpenChange(false);
          }}
        />
      ) : null}

      <SheetContent
        data-testid="reusable-sheet"
        overlay={false}
        className={cn(
          // Panneau flottant : détaché des bords, coins arrondis.
          'inset-4 start-auto h-auto rounded-xl p-0 gap-0',
          // Bordure franche sur les quatre côtés, et une ombre portée qui
          // décolle le panneau du fond. `border-s` seul, hérité de la
          // variante `side`, ne se voyait que sur le bord gauche ; et
          // `--border` sert à séparer des éléments du même plan, il s'efface
          // sous un panneau flottant — d'où son propre token.
          'border-2 border-[var(--sheet-border)] shadow-2xl shadow-black/25',
          // 70 % de l'écran : les fiches portent des formulaires sur deux
          // colonnes, la valeur par défaut de la variante les serrait trop.
          'w-[calc(100%-2rem)] sm:w-[70%] sm:max-w-none',
          '[&_[data-slot=sheet-close]]:top-5 [&_[data-slot=sheet-close]]:end-5',
          className,
        )}
        onInteractOutside={(e) => {
          if (preventClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (preventClose) e.preventDefault();
        }}
      >
        <SheetHeader className="shrink-0 space-y-2 border-b border-border px-6 py-4">
          <SheetTitle className="truncate pe-10 text-xl">{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
          {renderHeaderExtra?.(hooks)}
        </SheetHeader>

        {/*
         * Le corps est lui-même la zone défilante.
         *
         * `min-h-0` est indispensable : sans lui, un enfant flex refuse de
         * rétrécir sous sa taille de contenu et le défilement ne prend pas.
         *
         * Pas de `ScrollArea` imbriquée ici : sa hauteur `h-full` est un
         * pourcentage, et un pourcentage ne résout rien quand le parent tire
         * sa hauteur du flex plutôt que d'une hauteur explicite — le contenu
         * passerait sous le pied de panneau.
         */}
        <SheetBody className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {renderBody(hooks)}
        </SheetBody>

        {renderFooter ? (
          <SheetFooter className="shrink-0 border-t border-border px-6 py-4">
            {renderFooter(hooks)}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
