import { useEffect, useRef, useState } from 'react';
import { CalendarClock, CirclePlus, Flag } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MarkdownText } from '@/components/shared/MarkdownText';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toneOf } from '@/shared/constants/tone';
import {
  ACTIVITIES_UI,
  ACTIVITY_RAIL_DOTS,
  ACTIVITY_RESULT_TONES,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_STATUS_TONES,
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

/** Taille de page de la frise, alignee sur ce que la route accepte. */
const ACTIVITIES_PAGE = 50;

/**
 * Ou ranger une entree de la frise, du point de vue de la couleur. `isLate`
 * vient du serveur et n'est jamais recalcule ici.
 */
function railKey(activity: Activity): keyof typeof ACTIVITY_RAIL_DOTS {
  if (activity.status === 'PLANNED') {
    return isLate(activity.date) ? 'late' : 'planned';
  }
  return activity.status === 'DONE' ? 'done' : 'cancelled';
}

/**
 * La geometrie du rail, en un seul endroit : les quatre valeurs tiennent
 * ensemble autour d'un axe a 12 px du bord. Separees, elles se desalignaient
 * des qu'on touchait a l'une d'elles.
 */
const RAIL = {
  /** Retrait de la liste et trait vertical, centre a 12 px. */
  LIST: "relative space-y-5 py-2 ps-8 before:absolute before:bottom-3 before:left-[11px] before:top-3 before:w-0.5 before:rounded-full before:bg-border before:content-['']",
  /** Bille de 14 px : 32 - 27 = 5, centre a 12. */
  DOT: 'absolute -left-[27px] top-3 size-3.5 rounded-full border-[3px] border-background',
  /** Jalon de 24 px : 32 - 32 = 0, centre a 12. */
  END: 'absolute -left-[32px] top-0 grid size-6 place-items-center rounded-full border-[3px] border-background bg-muted text-muted-foreground shadow-[0_0_0_2px_var(--border)]',
  /** Meme retrait que la liste, pour ce qui se pose sous elle. */
  INDENT: 'ps-8',
} as const;

/** Les deux sections de l'onglet, nommees une fois. */
const SECTION = { UPCOMING: 'upcoming', PAST: 'past' } as const;

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
  highlightId = null,
}: {
  organizationId: string;
  /** Action visee par un lien — depuis l'agenda, par exemple. */
  highlightId?: string | null;
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

  /*
   * La route est paginee et trie par date decroissante : une page pleine coupe
   * les actions les plus anciennes, jamais les prochaines. « Voir plus » monte
   * la limite d'une page au lieu de naviguer — dans un accordeon, une
   * pagination a numeros couterait plus a lire qu'elle ne rapporte.
   */
  const [limit, setLimit] = useState(ACTIVITIES_PAGE);
  const { activities, meta, loading } = useActivities({ organizationId, limit });
  const hidden = Math.max((meta?.total ?? 0) - activities.length, 0);
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

  /*
   * Ce qu'il reste a faire d'abord, ce qui a eu lieu ensuite.
   *
   * Le serveur trie en date **decroissante**, et ce tri-la ne doit pas
   * changer : la route est paginee, et c'est lui qui garantit qu'on recoit les
   * cinquante actions les plus recentes plutot que les cinquante plus
   * anciennes. L'ordre d'affichage, lui, nous appartient — a l'interieur de ce
   * qu'on a recu. Les planifiees remontent, de la plus proche a la plus
   * lointaine ; l'historique suit, du plus recent au plus ancien.
   */
  const key = (x: Activity) => `${x.date} ${x.time ?? ''}`;
  const upcoming = activities
    .filter((a) => a.status === 'PLANNED')
    .sort((a, b) => key(a).localeCompare(key(b)));
  const past = activities
    .filter((a) => a.status !== 'PLANNED')
    .sort((a, b) => key(b).localeCompare(key(a)));

  const openSections: string[] = [SECTION.UPCOMING];
  /*
   * L'historique se deplie quand il est tout ce qu'il y a : un accordeon replie
   * sur une section unique demande un clic pour ne rien reveler d'autre, et
   * l'onglet parait vide alors qu'il porte deux actions.
   */
  if (upcoming.length === 0) openSections.push(SECTION.PAST);
  /*
   * Une action visee depuis l'agenda peut etre close : sans cela, l'ancre
   * pointerait une ligne restee dans la section repliee, donc absente du DOM.
   */
  if (highlightId && past.some((a) => a.id === highlightId)) openSections.push(SECTION.PAST);

  /*
   * Defilement instantane, pas `smooth` : une animation ferait courir la
   * verification apres la position, et l'ancre n'est utile qu'a l'ouverture.
   */
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!highlightId || loading) return;
    listRef.current
      ?.querySelector(`[data-testid="activity-row-${highlightId}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [highlightId, loading]);

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

  /*
   * Le rail vertical remplace la bordure de chaque carte : une frise se lit de
   * haut en bas, une pile de cartes bordees se lit une par une.
   */
  const timeline = (list: Activity[], ended = false) => (
    <ul className={RAIL.LIST}>
      {list.map((a) => (
              <li
                key={a.id}
                data-testid={`activity-row-${a.id}`}
                className={`relative rounded-lg px-3 py-2 ${
                  a.id === highlightId ? 'bg-primary/5 ring-1 ring-primary' : ''
                }`}
              >
                <span
                  aria-hidden
                  className={`${RAIL.DOT} ${ACTIVITY_RAIL_DOTS[railKey(a)]}`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-sm">{a.type.label}</b>
                  <Badge
                    variant={toneOf(ACTIVITY_STATUS_TONES, a.status)}
                    appearance="outline"
                    data-testid={`activity-status-${a.id}`}
                  >
                    <BadgeDot />
                    {ACTIVITY_STATUS_LABELS[a.status]}
                  </Badge>
                  {a.result ? (
                    <Badge
                      variant={toneOf(ACTIVITY_RESULT_TONES, a.result.key)}
                      appearance="outline"
                    >
                      <BadgeDot />
                      {a.result.label}
                    </Badge>
                  ) : null}
                </div>

                {/* Le compte rendu est du texte en base ; le balisage n'existe
                    qu'ici. Un compte rendu vide reste une phrase, pas un rendu
                    Markdown a vide. */}
                {a.report ? (
                  <MarkdownText className="mt-2 text-sm text-muted-foreground">
                    {a.report}
                  </MarkdownText>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {UI.TIMELINE.NO_REPORT}
                  </p>
                )}

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

                {/* Une action close est de l'histoire : le serveur refuserait de
                    la realiser, de la modifier ou de l'annuler. Seule la
                    suppression reste, et la barre ne parait que si elle porte
                    au moins un geste. */}
                {canDelete || (canUpdate && a.status === 'PLANNED') ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    {a.status === 'PLANNED' && canUpdate ? (
                      <>
                        <Button
                          size="sm"
                          disabled={mutations.saving || mutations.busy}
                          data-testid={`activity-do-${a.id}`}
                          onClick={() => setCompleting(a)}
                        >
                          {UI.ACTIONS.COMPLETE}
                        </Button>
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
                        variant="destructiveOutline"
                        size="sm"
                        data-testid={`activity-delete-${a.id}`}
                        onClick={() => setConfirm({ activity: a, kind: 'delete' })}
                      >
                        {UI.ACTIONS.DELETE}
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </li>
      ))}

      {/* Le rail s'arrete sur un jalon plutot que dans le vide : sans lui, on
          ne sait pas si l'historique est complet ou simplement coupe. Il ne
          parait donc que lorsque tout est charge. */}
      {ended ? (
        <li className="relative px-3 pt-1" data-testid="activities-end">
          <span
            aria-hidden
            className={RAIL.END}
          >
            <Flag className="size-3" />
          </span>
          <span className="text-xs text-muted-foreground">{UI.SECTIONS.END}</span>
        </li>
      ) : null}
    </ul>
  );

  return (
    <div ref={listRef} className="space-y-4" data-testid="organization-activities">
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
        /*
         * Deux sections plutot qu'une frise unique : « A venir » va du plus
         * proche au plus lointain, « Historique » du plus recent au plus
         * ancien. Sur un rail continu, ce renversement se lit comme un
         * desordre. L'historique est replie : ce qu'on vient chercher ici,
         * c'est le prochain geste.
         */
        <Accordion type="multiple" defaultValue={openSections}>
          {upcoming.length ? (
            <AccordionItem value={SECTION.UPCOMING}>
              <AccordionTrigger data-testid="activities-upcoming">
                <span className="flex items-center gap-2">
                  {UI.SECTIONS.UPCOMING}
                  <Badge variant="secondary" appearance="outline" size="sm">
                    {upcoming.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>{timeline(upcoming)}</AccordionContent>
            </AccordionItem>
          ) : null}

          {past.length ? (
            <AccordionItem value={SECTION.PAST}>
              <AccordionTrigger data-testid="activities-past">
                <span className="flex items-center gap-2">
                  {UI.SECTIONS.PAST}
                  <Badge variant="secondary" appearance="outline" size="sm">
                    {past.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {timeline(past, hidden === 0)}
                {/* Le compte manquant vient de `meta.total`, pas d'une
                    supposition : sans lui, la frise se tronquait en silence. */}
                {hidden > 0 ? (
                  <div className={`${RAIL.INDENT} pt-3`}>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="activities-more"
                      disabled={loading}
                      onClick={() => setLimit((l) => l + ACTIVITIES_PAGE)}
                    >
                      {UI.SECTIONS.MORE(hidden)}
                    </Button>
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
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
