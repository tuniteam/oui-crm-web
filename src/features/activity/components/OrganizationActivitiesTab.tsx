import { useState } from 'react';
import { CalendarClock, CirclePlus } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ACTIVITIES_UI,
  ACTIVITY_STATUS_LABELS,
} from '../constants/activity.constants';
import { useActivities } from '../hooks/useActivities';
import { useActivityMutations } from '../hooks/useActivityMutations';
import { useActivityReference } from '../hooks/useActivityReference';
import type { Activity } from '../types/activity';
import { daysFromToday, formatDayFr, isLate } from '../utils/activity-date';
import { ActivityCompleteWindow } from './ActivityCompleteWindow';
import { ActivityConfirmWindow } from './ActivityConfirmWindow';
import { ActivityWindow } from './ActivityWindow';

const UI = ACTIVITIES_UI;

type Confirm = { activity: Activity; kind: 'cancel' | 'delete' };

/**
 * L'onglet Actions d'une fiche — L1 · US-01-08.
 *
 * Une **frise chronologique**, comme la V8 : ce qui s'est dit, pas un tableau
 * de champs. Le commercial est en scope `OWN` et le serveur filtre en SQL —
 * on ne refiltre jamais ici, sous peine de masquer des lignes aux rôles qui
 * ont le droit de tout voir.
 */
export function OrganizationActivitiesTab({
  organizationId,
}: {
  organizationId: string;
}) {
  const [editing, setEditing] = useState<Activity | null>(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [completing, setCompleting] = useState<Activity | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const canCreate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ACTIVITIES.CREATE),
  );
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ACTIVITIES.UPDATE),
  );
  // Le commercial ne l'a pas : l'action disparaît plutôt que d'échouer.
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ACTIVITIES.DELETE),
  );

  const { activities, loading } = useActivities({ organizationId, limit: 50 });
  const mutations = useActivityMutations();
  const { types } = useActivityReference();

  /*
   * La prochaine action est la planifiée la plus proche. Une action en retard
   * **reste la prochaine** : elle ne disparaît pas parce que sa date est
   * passée, c'est justement celle qu'il faut traiter.
   */
  const next = activities
    .filter((a) => a.status === 'PLANNED')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const openWindow = (activity: Activity | null) => {
    setEditing(activity);
    setWindowOpen(true);
  };

  const isMeeting = (a: Activity) =>
    types.find((t) => t.key === a.type.key)?.ics === true;

  /* Annuler et supprimer ferment la fenetre des que le serveur a tranche —
     y compris sur un refus « deja close », qui recharge la frise. */
  const runConfirm = async () => {
    if (!confirm) return;
    const failed =
      confirm.kind === 'delete'
        ? (await mutations.remove(confirm.activity.id)) === 'error'
        : (await mutations.cancel(confirm.activity.id)).status === 'error';
    if (!failed) setConfirm(null);
  };

  if (loading) {
    return (
      <div className="space-y-2" data-testid="activities-loading">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="organization-activities">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {next ? (
          <p
            data-testid="activity-next"
            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
              isLate(next.date)
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-muted/40'
            }`}
          >
            <CalendarClock className="mt-0.5 size-4 shrink-0" />
            <span>
              {UI.NEXT.LINE(
                next.type.label,
                formatDayFr(next.date),
                next.time,
                isLate(next.date)
                  ? Math.abs(daysFromToday(next.date) ?? 0)
                  : null,
              )}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{UI.NEXT.NONE}</p>
        )}

        {canCreate ? (
          <Button data-testid="activity-add" onClick={() => openWindow(null)}>
            <CirclePlus className="size-4" />
            {UI.ADD}
          </Button>
        ) : null}
      </div>

      {activities.length === 0 ? (
        <div
          data-testid="activities-empty"
          className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
        >
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="mx-auto mt-1 max-w-[55ch] text-sm text-muted-foreground">
            {UI.EMPTY.DESCRIPTION}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((a) => (
            <li
              key={a.id}
              data-testid={`activity-row-${a.id}`}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <b className="text-sm">{a.type.label}</b>
                <Badge
                  variant={a.status === 'DONE' ? 'primary' : 'secondary'}
                  appearance="outline"
                  data-testid={`activity-status-${a.id}`}
                >
                  {ACTIVITY_STATUS_LABELS[a.status]}
                </Badge>
                {a.result ? (
                  <Badge variant="secondary" appearance="outline">
                    {a.result}
                  </Badge>
                ) : null}
              </div>

              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {a.report || UI.TIMELINE.NO_REPORT}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {/* Jour et heure lus tels quels : jamais reconstruits en `Date`,
                    ce qui décalerait les rendez-vous d'un fuseau. */}
                {formatDayFr(a.date)}
                {a.time ? ` ${UI.TIMELINE.AT(a.time)}` : ''}
                {a.durationMin ? ` · ${UI.TIMELINE.DURATION(a.durationMin)}` : ''}
                {a.location ? ` · ${a.location}` : ''}
                {` · ${a.user.fullName}`}
                {a.contact ? ` · ${a.contact.fullName}` : ''}
              </p>

              {/* Ces trois gestes n'existent que sur une action planifiée : une
                  action close est de l'histoire, le serveur les refuserait. */}
              {a.status === 'PLANNED' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {canUpdate ? (
                    <Button
                      size="sm"
                      disabled={mutations.saving || mutations.busy}
                      data-testid={`activity-do-${a.id}`}
                      onClick={() => setCompleting(a)}
                    >
                      {UI.ACTIONS.COMPLETE}
                    </Button>
                  ) : null}
                  {canUpdate ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`activity-edit-${a.id}`}
                        onClick={() => openWindow(a)}
                      >
                        {UI.ACTIONS.EDIT}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`activity-cancel-${a.id}`}
                        onClick={() => setConfirm({ activity: a, kind: 'cancel' })}
                      >
                        {UI.ACTIONS.CANCEL}
                      </Button>
                    </>
                  ) : null}
                  {canDelete ? (
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`activity-delete-${a.id}`}
                      onClick={() => setConfirm({ activity: a, kind: 'delete' })}
                    >
                      {UI.ACTIONS.DELETE}
                    </Button>
                  ) : null}
                </div>
              ) : canDelete ? (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`activity-delete-${a.id}`}
                    onClick={() => setConfirm({ activity: a, kind: 'delete' })}
                  >
                    {UI.ACTIONS.DELETE}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ActivityWindow
        open={windowOpen}
        onOpenChange={setWindowOpen}
        organizationId={organizationId}
        activity={editing}
      />

      <ActivityCompleteWindow
        activity={completing}
        onOpenChange={(open) => !open && setCompleting(null)}
      />

      <ActivityConfirmWindow
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        onConfirm={() => void runConfirm()}
        busy={mutations.busy}
        kind={confirm?.kind ?? 'cancel'}
        wasMeeting={confirm ? isMeeting(confirm.activity) : false}
      />
    </div>
  );
}
