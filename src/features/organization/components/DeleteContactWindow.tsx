import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { DELETE_CONTACT_WINDOW } from '../constants/contact.constants';
import type { DeleteOutcome } from '../hooks/useContactMutations';
import type { Contact } from '../types/contact';

type Props = {
  contact: Contact;
  onOpenChange: (open: boolean) => void;
  deleting: boolean;
  onDelete: () => Promise<DeleteOutcome>;
  onOptOut: () => Promise<boolean>;
  labels: typeof DELETE_CONTACT_WINDOW;
};

/**
 * Suppression d'un contact — US-01-04.
 *
 * Le serveur refuse la suppression tant qu'une action référence le contact
 * (`409 CONTACT_HAS_ACTIVITIES`) : l'historique garde ses acteurs. Ce refus
 * n'est pas une erreur mais une bifurcation, et le contrat dit laquelle —
 * proposer « ne pas démarcher », qui exclut le contact des campagnes sans
 * toucher au passé. La fenêtre bascule donc sur cette sortie au lieu
 * d'afficher un message sans suite.
 */
export function DeleteContactWindow({
  contact,
  onOpenChange,
  deleting,
  onDelete,
  onOptOut,
  labels,
}: Props) {
  const [blocked, setBlocked] = useState(false);

  return (
    <ReusableWindow<Record<string, never>>
      open
      onOpenChange={onOpenChange}
      title={labels.TITLE}
      description={[contact.civility, contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(' ')}
      useHooks={() => ({})}
      preventClose
      renderBody={() =>
        blocked ? (
          <div
            data-testid="contact-delete-blocked"
            className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert className="size-4" />
              {labels.BLOCKED.TITLE}
            </p>
            <p className="text-sm text-muted-foreground">
              {labels.BLOCKED.DESCRIPTION}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">{labels.INTRO}</p>
            <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
              {labels.BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )
      }
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {labels.ACTIONS.CANCEL}
          </Button>

          {blocked ? (
            <Button
              type="button"
              data-testid="contact-optout"
              disabled={deleting}
              onClick={async () => {
                if (await onOptOut()) onOpenChange(false);
              }}
            >
              {labels.BLOCKED.ACTION}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              data-testid="contact-delete-confirm"
              disabled={deleting}
              onClick={async () => {
                const outcome = await onDelete();
                if (outcome === 'deleted') onOpenChange(false);
                if (outcome === 'has-activities') setBlocked(true);
              }}
            >
              {labels.ACTIONS.CONFIRM}
            </Button>
          )}
        </>
      )}
    />
  );
}
