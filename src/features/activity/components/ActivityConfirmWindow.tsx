import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  ACTIVITY_CANCEL_WINDOW,
  ACTIVITY_DELETE_WINDOW,
} from '../constants/activity.constants';

const emptyHooks = (): Record<string, never> => ({});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  busy: boolean;
  kind: 'cancel' | 'delete';
  /** L'action portait-elle un rendez-vous ? Conditionne l'avertissement. */
  wasMeeting: boolean;
};

/**
 * Annuler ou supprimer une action — L1 · US-01-08.
 *
 * Les deux gestes partagent un avertissement : **le statut commercial de la
 * fiche ne redescend pas**. Constaté en direct contre l'API et signalé
 * (`docs/SIGNALEMENT-API-ACTIVITES.md`) — une fiche passée « RDV planifié » le
 * reste, sans rendez-vous. Le taire laisserait croire à une annulation propre.
 */
export function ActivityConfirmWindow({
  open,
  onOpenChange,
  onConfirm,
  busy,
  kind,
  wasMeeting,
}: Props) {
  const UI = kind === 'delete' ? ACTIVITY_DELETE_WINDOW : ACTIVITY_CANCEL_WINDOW;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={emptyHooks}
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-3" data-testid={`activity-confirm-${kind}`}>
          <p className="text-sm">{UI.CONFIRM}</p>
          {/* Seul un rendez-vous a fait basculer le statut : l'avertir ailleurs
              serait du bruit. */}
          {wasMeeting ? (
            <p
              data-testid="activity-status-warning"
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              {UI.STATUS_WARNING}
            </p>
          ) : null}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            data-testid={`activity-${kind}-back`}
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            data-testid={`activity-${kind}-confirm`}
            onClick={onConfirm}
          >
            {UI.ACTIONS.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
