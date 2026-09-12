import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { describeCounts } from '@/shared/utils/string-utils';
import {
  DELETE_ACCOUNT_UI,
  USER_REFERENCE_LABELS,
} from '../../constants/delete-account.constants';
import { useDeleteUserAccount } from '../../hooks/useDeleteUserAccount';

const UI = DELETE_ACCOUNT_UI;

/**
 * Supprimer définitivement un compte — US-00-05 §7.
 *
 * Le refus `409 USER_HAS_REFERENCES` **reste affiché dans la fenêtre**, avec ce
 * qui le motive et le geste de repli : « 4 organismes et 2 devis lui sont
 * rattachés… vous pouvez le retirer du projet à la place ». Fermer sur un
 * message au coin de l'écran laisserait l'administrateur sans issue, à
 * recliquer le même bouton.
 */
export function DeleteAccountWindow({
  open,
  onOpenChange,
  userId,
  userName,
  onDeleted,
  onRemoveInstead,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  onDeleted: () => void;
  /** Le repli quand la suppression est refusée : le retrait du projet. */
  onRemoveInstead: () => void;
}) {
  const { deleteAccount, pending } = useDeleteUserAccount();
  const [refused, setRefused] = useState<Record<string, number> | null>(null);

  /* Rouvrir doit repartir de la question, pas du refus précédent. */
  useEffect(() => {
    if (!open) setRefused(null);
  }, [open]);

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.WINDOW.TITLE(userName)}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-3 text-sm" data-testid="user-delete-account-window">
          {refused ? (
            <div
              data-testid="user-delete-account-refused"
              className="space-y-2 rounded-lg border border-warning bg-warning-soft p-3"
            >
              <p className="font-semibold">{UI.REFUSED.TITLE}</p>
              <p>
                {UI.REFUSED.SENTENCE(
                  describeCounts(refused, USER_REFERENCE_LABELS),
                )}
              </p>
              <p className="text-muted-foreground">{UI.REFUSED.FALLBACK}</p>
            </div>
          ) : (
            <>
              <p className="font-medium text-destructive">{UI.WINDOW.LEAD}</p>
              <ul className="list-disc space-y-1 ps-5 text-muted-foreground">
                {UI.WINDOW.BULLETS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      renderFooter={() =>
        refused ? (
          <>
            <Button
              type="button"
              variant="outline"
              data-testid="user-delete-account-close"
              onClick={() => onOpenChange(false)}
            >
              {UI.WINDOW.CANCEL}
            </Button>
            {/* Le geste de repli, là où l'utilisateur regarde déjà. */}
            <Button
              type="button"
              data-testid="user-delete-account-remove-instead"
              onClick={() => {
                onOpenChange(false);
                onRemoveInstead();
              }}
            >
              {UI.REFUSED.REMOVE}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              data-testid="user-delete-account-cancel"
              onClick={() => onOpenChange(false)}
            >
              {UI.WINDOW.CANCEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              data-testid="user-delete-account-confirm"
              onClick={async () => {
                const result = await deleteAccount(userId);
                if (result === true) {
                  onOpenChange(false);
                  onDeleted();
                  return;
                }
                if (result.kind === 'REFERENCES') {
                  setRefused(result.counts);
                  return;
                }
                onOpenChange(false);
              }}
            >
              {UI.WINDOW.CONFIRM}
            </Button>
          </>
        )
      }
    />
  );
}
