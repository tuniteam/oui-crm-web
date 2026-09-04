import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { BOARD_CLOSE_WINDOW } from '../constants/board.constants';
import type { BoardCard } from '../types/board';

const UI = BOARD_CLOSE_WINDOW;
const emptyHooks = (): Record<string, never> => ({});

type Props = {
  /** La carte déposée sur « Clôturé », ou `null`. */
  card: BoardCard | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
};

/**
 * Le motif d'un abandon — L1 · US-01-10.
 *
 * `reason` est facultatif au contrat, et part au journal. Le demander à chaque
 * déplacement alourdirait un geste qui doit rester fluide ; ne jamais le
 * proposer priverait le journal de ce qui explique un abandon. On le demande
 * donc au seul passage à « Clôturé », où il a une valeur.
 *
 * La fenêtre s'ouvre **avant** l'appel : tant qu'elle n'est pas validée, la
 * carte n'a pas bougé côté serveur.
 */
export function BoardCloseWindow({ card, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (card) setReason('');
  }, [card]);

  return (
    <ReusableWindow<Record<string, never>>
      open={!!card}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={emptyHooks}
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-3" data-testid="board-close">
          {/* Le réveil est manuel au L1 : le retour automatique après six mois
              appartient au lot L2. Ne pas le promettre. */}
          <p className="text-sm">{card ? UI.DESCRIPTION(card.name) : ''}</p>

          <div className="space-y-1.5">
            <Label htmlFor="board-close-reason">{UI.FIELD}</Label>
            <Textarea
              id="board-close-reason"
              rows={3}
              maxLength={UI.MAX}
              value={reason}
              placeholder={UI.PLACEHOLDER}
              data-testid="board-close-reason"
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{UI.HINT}</p>
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="board-close-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="board-close-confirm"
            onClick={() => void onConfirm(reason)}
          >
            {UI.ACTIONS.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
