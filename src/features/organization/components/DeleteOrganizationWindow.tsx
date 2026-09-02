import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { DELETE_ORGANIZATION_WINDOW } from '../constants/organizationDelete.constants';
import { useDeleteOrganization } from '../hooks/useDeleteOrganization';

const UI = DELETE_ORGANIZATION_WINDOW;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organizationName: string;
  /** Ferme le panneau : la fiche supprimée n'a plus rien à montrer. */
  onDeleted: () => void;
};

type Hooks = ReturnType<typeof useDeleteOrganization>;

/** Confirmation de suppression — US-01-13. */
export function DeleteOrganizationWindow({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  onDeleted,
}: Props) {
  return (
    <ReusableWindow<Hooks>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      description={organizationName}
      useHooks={useDeleteOrganization}
      preventClose
      renderBody={() => (
        <div className="space-y-4">
          <p className="text-sm">{UI.INTRO}</p>

          <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert className="size-4" />
              {UI.WARNING.TITLE}
            </p>
            <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
              {UI.WARNING.BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            data-testid="organization-delete-confirm"
            disabled={hooks.loading}
            onClick={async () => {
              if (await hooks.remove(organizationId)) {
                onOpenChange(false);
                onDeleted();
              }
            }}
          >
            {UI.ACTIONS.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
