import { useState } from 'react';
import { Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { ACTIVATE_PROJECT_UI, PROJECT_STATUS } from '../../constants/constants';
import { useActivateProject } from '../../hooks/useActivateProject';
import type { ProjectDetailsResponse } from '../../types/projectDetails';

const UI = ACTIVATE_PROJECT_UI;

/**
 * « Activer le projet », posé à côté du statut qu'il change.
 *
 * On lit « Brouillon » et, juste à côté, le geste qui le fait passer à
 * « Actif » : l'action s'explique par sa place. Elle n'existe que pour un
 * projet en brouillon et pour qui a `projects:update` — le front masque, le
 * serveur décide.
 *
 * La confirmation est **obligatoire** : l'activation ouvre le projet à ses
 * membres, et il n'y a pas de retour en brouillon, seulement l'archivage.
 */
export function ActivateProjectAction({
  project,
}: {
  project: ProjectDetailsResponse;
}) {
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.PROJECTS.UPDATE),
  );
  const [open, setOpen] = useState(false);
  const { activate, activating } = useActivateProject(project.id);

  if (project.status !== PROJECT_STATUS.DRAFT || !canUpdate) return null;

  return (
    <>
      <Button
        type="button"
        size="sm"
        data-testid="project-activate-btn"
        onClick={() => setOpen(true)}
      >
        <Power />
        {UI.BUTTON}
      </Button>

      <ReusableWindow<Record<string, never>>
        open={open}
        onOpenChange={setOpen}
        title={UI.TITLE(project.name)}
        useHooks={noWindowHooks}
        className="max-w-lg"
        renderBody={() => (
          <p className="text-sm" data-testid="project-activate-window">
            {UI.LEAD}
          </p>
        )}
        renderFooter={() => (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={activating}
              data-testid="project-activate-cancel"
              onClick={() => setOpen(false)}
            >
              {UI.CANCEL}
            </Button>
            <Button
              type="button"
              disabled={activating}
              data-testid="project-activate-confirm"
              onClick={async () => {
                /* La fenêtre se ferme sur toute issue : réussite, 409 (la
                   fiche se recharge) ou 404 (retour à la liste). */
                await activate();
                setOpen(false);
              }}
            >
              {UI.CONFIRM}
            </Button>
          </>
        )}
      />
    </>
  );
}
