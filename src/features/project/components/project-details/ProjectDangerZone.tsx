import { useState } from 'react';
import { Archive, Power, Trash2, TriangleAlert, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DetailsSection } from '@/components/layouts/layout-1/shared/details-page/DetailsSection';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { formatInteger } from '@/shared/utils/string-utils';
import {
  ACTIVATE_PROJECT_UI,
  PROJECT_DANGER_UI,
  PROJECT_DATA_LABELS,
  PROJECT_STATUS,
  RESTORE_PROJECT_UI,
} from '../../constants/constants';
import { useChangeProjectStatus } from '../../hooks/useChangeProjectStatus';
import { useDeleteProject, type ProjectDataCounts } from '../../hooks/useDeleteProject';
import type { ProjectStatus } from '../../types/project';
import type { ProjectDetailsResponse } from '../../types/projectDetails';
import { ConfirmByNameWindow } from './ConfirmByNameWindow';

const UI = PROJECT_DANGER_UI;

type Lifecycle = {
  title: string;
  description: string;
  button: string;
  icon: typeof Power;
  target: ProjectStatus;
  testId: string;
  /** Réussite et panne, dites par le toast. */
  done: string;
  failed: string;
  /**
   * La confirmation simple — activer, restaurer. Absente pour l'archivage,
   * qui exige de ressaisir le nom : il coupe l'accès des membres.
   */
  simple: { TITLE: (name: string) => string; LEAD: string; CONFIRM: string; CANCEL: string } | null;
};

/**
 * Le geste de cycle de vie, selon le statut — **un seul endroit** pour les
 * trois.
 *
 * Activer, archiver et restaurer changent tous le statut du projet : les
 * répartir entre le badge de statut et la zone de danger obligeait à
 * chercher. La carte s'échange selon l'état, et le geste suivant est toujours
 * au même endroit. Écrit en données plutôt qu'en trois composants presque
 * identiques.
 */
const LIFECYCLE: Partial<Record<ProjectStatus, Lifecycle>> = {
  [PROJECT_STATUS.DRAFT]: {
    title: ACTIVATE_PROJECT_UI.CARD_TITLE,
    description: ACTIVATE_PROJECT_UI.CARD_DESCRIPTION,
    button: ACTIVATE_PROJECT_UI.BUTTON,
    icon: Power,
    target: PROJECT_STATUS.ACTIVE,
    testId: 'project-activate',
    done: ACTIVATE_PROJECT_UI.DONE,
    failed: ACTIVATE_PROJECT_UI.FAILED,
    simple: ACTIVATE_PROJECT_UI,
  },
  [PROJECT_STATUS.ACTIVE]: {
    title: UI.ARCHIVE.TITLE,
    description: UI.ARCHIVE.DESCRIPTION,
    button: UI.ARCHIVE.BUTTON,
    icon: Archive,
    target: PROJECT_STATUS.ARCHIVED,
    testId: 'project-archive',
    done: UI.ARCHIVE.DONE,
    failed: UI.ARCHIVE.FAILED,
    simple: null,
  },
  [PROJECT_STATUS.ARCHIVED]: {
    title: RESTORE_PROJECT_UI.CARD_TITLE,
    description: RESTORE_PROJECT_UI.CARD_DESCRIPTION,
    button: RESTORE_PROJECT_UI.BUTTON,
    icon: Undo2,
    target: PROJECT_STATUS.ACTIVE,
    testId: 'project-restore',
    done: RESTORE_PROJECT_UI.DONE,
    failed: RESTORE_PROJECT_UI.FAILED,
    simple: RESTORE_PROJECT_UI,
  },
};

/** « 36 224 organismes et 3 devis » — les compteurs non nuls, en français. */
function describeContents(counts: ProjectDataCounts): string {
  const parts = Object.entries(counts).map(([key, n]) => {
    const [one, many] = PROJECT_DATA_LABELS[key] ?? [key, key];
    return `${formatInteger(n)} ${n > 1 ? many : one}`;
  });
  return parts.length > 1
    ? `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`
    : parts[0] ?? '';
}

/**
 * La zone de danger de la fiche : le cycle de vie du projet, puis sa
 * suppression.
 *
 * Même disposition que la suppression d'un organisme : une carte par geste,
 * ce qu'il fait à gauche, le bouton à droite. L'aplat rouge n'existe que là où
 * l'action destructrice s'engage : sur « Supprimer », définitif — pas sur le
 * cycle de vie.
 *
 * Quand la suppression est refusée faute d'être vide, le refus reste affiché
 * avec ses compteurs et propose d'archiver : pas d'impasse.
 */
export function ProjectDangerZone({ project }: { project: ProjectDetailsResponse }) {
  const canUpdate = useMeStore((s) => s.hasPermission(PERMISSIONS.PROJECTS.UPDATE));
  const canDelete = useMeStore((s) => s.hasPermission(PERMISSIONS.PROJECTS.DELETE));
  const lifecycle = canUpdate ? (LIFECYCLE[project.status] ?? null) : null;
  const canArchive = lifecycle?.target === PROJECT_STATUS.ARCHIVED;

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nameMismatch, setNameMismatch] = useState(false);
  const [deleteMismatch, setDeleteMismatch] = useState(false);
  const [notEmpty, setNotEmpty] = useState<ProjectDataCounts | null>(null);

  const { changeStatus, pending: statusPending } = useChangeProjectStatus(project.id);
  const { remove, pending: deletePending } = useDeleteProject(project.id);

  if (!lifecycle && !canDelete) return null;

  const openLifecycle = () => {
    setNameMismatch(false);
    setConfirming(true);
  };

  return (
    <DetailsSection title={UI.TITLE}>
      <div className="space-y-3" data-testid="project-danger-zone">
        {notEmpty ? (
          <div
            data-testid="project-delete-not-empty"
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning bg-warning-soft px-4 py-3 text-sm"
          >
            <p className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                {UI.DELETE.NOT_EMPTY(project.name, describeContents(notEmpty))}{' '}
                {/* Un brouillon ne s'archive pas : le dire plutôt que de
                    proposer un geste que le serveur refuserait. */}
                {canArchive ? UI.DELETE.NOT_EMPTY_ARCHIVE : null}
                {project.status === PROJECT_STATUS.DRAFT ? UI.DELETE.NOT_EMPTY_DRAFT : null}
              </span>
            </p>
            {canArchive ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="project-delete-archive-instead"
                onClick={openLifecycle}
              >
                <Archive />
                {UI.ARCHIVE.CONFIRM}
              </Button>
            ) : null}
          </div>
        ) : null}

        {lifecycle ? (
          <Card data-testid="project-lifecycle-card">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <div className="text-sm font-semibold">{lifecycle.title}</div>
                <div className="text-xs text-muted-foreground">{lifecycle.description}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                data-testid={`${lifecycle.testId}-btn`}
                onClick={openLifecycle}
              >
                <lifecycle.icon />
                {lifecycle.button}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {canDelete ? (
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <div className="text-sm font-semibold">{UI.DELETE.TITLE}</div>
                <div className="text-xs text-muted-foreground">{UI.DELETE.DESCRIPTION}</div>
              </div>
              <Button
                type="button"
                variant="destructive"
                data-testid="project-delete-btn"
                onClick={() => {
                  setDeleteMismatch(false);
                  setDeleting(true);
                }}
              >
                <Trash2 />
                {UI.DELETE.BUTTON}
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Archiver : la ressaisie du nom. */}
      {lifecycle && !lifecycle.simple ? (
        <ConfirmByNameWindow
          open={confirming}
          onOpenChange={setConfirming}
          title={UI.ARCHIVE.WINDOW_TITLE(project.name)}
          lead={[UI.ARCHIVE.LEAD]}
          projectName={project.name}
          confirmLabel={UI.ARCHIVE.CONFIRM}
          pending={statusPending}
          mismatch={nameMismatch}
          testId="project-archive"
          onConfirm={async (typed) => {
            const result = await changeStatus(
              lifecycle.target,
              { done: lifecycle.done, failed: lifecycle.failed },
              typed,
            );
            if (result === 'NAME_MISMATCH') {
              setNameMismatch(true);
              return;
            }
            setConfirming(false);
            if (result === 'OK') setNotEmpty(null);
          }}
        />
      ) : null}

      {/* Activer, restaurer : la confirmation simple. */}
      {lifecycle?.simple ? (
        <ReusableWindow<Record<string, never>>
          open={confirming}
          onOpenChange={setConfirming}
          title={lifecycle.simple.TITLE(project.name)}
          useHooks={noWindowHooks}
          className="max-w-lg"
          renderBody={() => (
            <p className="text-sm" data-testid={`${lifecycle.testId}-window`}>
              {lifecycle.simple?.LEAD}
            </p>
          )}
          renderFooter={() => (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={statusPending}
                data-testid={`${lifecycle.testId}-cancel`}
                onClick={() => setConfirming(false)}
              >
                {lifecycle.simple?.CANCEL}
              </Button>
              <Button
                type="button"
                disabled={statusPending}
                data-testid={`${lifecycle.testId}-confirm`}
                onClick={async () => {
                  /* Fermée sur toute issue : réussite, 409 (la fiche se
                     recharge) ou 404 (retour à la liste). */
                  await changeStatus(lifecycle.target, {
                    done: lifecycle.done,
                    failed: lifecycle.failed,
                  });
                  setConfirming(false);
                }}
              >
                {lifecycle.simple?.CONFIRM}
              </Button>
            </>
          )}
        />
      ) : null}

      <ConfirmByNameWindow
        open={deleting}
        onOpenChange={setDeleting}
        title={UI.DELETE.WINDOW_TITLE(project.name)}
        lead={UI.DELETE.LEAD}
        projectName={project.name}
        confirmLabel={UI.DELETE.CONFIRM}
        pending={deletePending}
        mismatch={deleteMismatch}
        testId="project-delete"
        onConfirm={async (typed) => {
          const outcome = await remove(typed);
          if (outcome.result === 'NAME_MISMATCH') {
            setDeleteMismatch(true);
            return;
          }
          /* 409 : on ferme la fenêtre, les compteurs et l'archivage restent
             affichés dans la zone. */
          if (outcome.result === 'NOT_EMPTY') setNotEmpty(outcome.counts);
          setDeleting(false);
        }}
      />
    </DetailsSection>
  );
}
