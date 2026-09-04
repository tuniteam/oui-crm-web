import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { BOARD_UI } from '../constants/board.constants';
import {
  ORGANIZATIONS_UI,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { useBoard } from '../hooks/useBoard';
import { useSalesStatus } from '../hooks/useSalesStatus';
import type { BoardCard as Card } from '../types/board';
import type { SalesStatus } from '../types/organizationList';
import { BoardCard } from './BoardCard';
import { BoardCloseWindow } from './BoardCloseWindow';
import { OrganizationPanel } from './OrganizationPanel';

const UI = BOARD_UI;

/**
 * « Non contacté » n'est pas affichée.
 *
 * Le tableau sert à faire avancer ce qui est **engagé**, comme dans la V8. Sur
 * une base importée cette colonne compte des milliers de fiches jamais
 * approchées : la montrer écraserait les quatre autres. On dit combien y
 * dorment et on renvoie à la liste, qui sait filtrer et agir en masse.
 */
const HIDDEN: SalesStatus = 'NOT_CONTACTED';

/** Suivi prospection — L1 · US-01-10. */
export default function ProspectionScreen() {
  const { projectId } = useParams();
  const [params, setParams] = useSearchParams();
  const openedId = params.get(ORGANIZATIONS_UI.PANEL_PARAM);
  /** Déplacement en attente d'un motif : la carte n'a pas encore bougé. */
  const [closing, setClosing] = useState<{ card: Card } | null>(null);
  /**
   * Cartes déplacées à l'écran, en attente de la réponse du serveur.
   *
   * Sans cela, la carte revenait visiblement à sa colonne d'origine entre la
   * fin du glissement et le rechargement : le déplacement n'était optimiste
   * que de nom. Chaque entrée disparaît d'elle-même quand le serveur confirme
   * — ou quand il infirme, ce qui remet la carte en place.
   */
  const [moved, setMoved] = useState<Record<string, SalesStatus>>({});

  const canMove = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.UPDATE),
  );

  const { columns, loading, loadMore, loadingMore } = useBoard();
  const { move } = useSalesStatus();

  const shown = columns.filter((c) => c.salesStatus !== HIDDEN);
  const hidden = columns.find((c) => c.salesStatus === HIDDEN);

  /* `Kanban` travaille sur `Record<colonne, cartes[]>`. Les déplacements en
     attente s'y appliquent, pour que la carte reste où on l'a lâchée. */
  const value = useMemo(() => {
    const out: Record<string, Card[]> = {};
    for (const c of shown) out[c.salesStatus] = [];
    for (const c of shown) {
      for (const card of c.items) {
        const target = moved[card.id] ?? c.salesStatus;
        (out[target] ?? out[c.salesStatus]).push(card);
      }
    }
    return out;
  }, [shown, moved]);

  /*
   * Le serveur fait foi : dès qu'il place la carte là où on l'a lâchée — ou
   * qu'il la laisse ailleurs après un refus — l'écart local n'a plus lieu
   * d'être. Se contenter de vider après l'appel ferait clignoter la carte
   * entre la réponse et le rechargement.
   */
  useEffect(() => {
    setMoved((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const c of shown) {
        for (const card of c.items) {
          if (next[card.id] && next[card.id] === c.salesStatus) {
            delete next[card.id];
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [shown]);

  const openPanel = (id: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(ORGANIZATIONS_UI.PANEL_PARAM, id);
        return next;
      },
      { replace: true },
    );

  const closePanel = () =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(ORGANIZATIONS_UI.PANEL_PARAM);
        return next;
      },
      { replace: true },
    );

  /*
   * Déplacement **optimiste** : `@dnd-kit` bouge la carte tout de suite, et le
   * serveur tranche ensuite. Attendre la réponse rendrait le geste poussif ;
   * un refus recharge le tableau, ce qui remet la carte à sa place.
   *
   * Le passage à « Clôturé » demande d'abord un motif : la carte reste où elle
   * est tant que la fenêtre n'est pas validée.
   */
  const onMove = async (id: string, to: SalesStatus) => {
    const card = shown.flatMap((c) => c.items).find((i) => i.id === id);
    if (!card || card.access === 'RESTRICTED') return;
    if (to === 'CLOSED') {
      // La carte ne bouge pas tant que le motif n'est pas donné.
      setClosing({ card });
      return;
    }
    setMoved((prev) => ({ ...prev, [id]: to }));
    const ok = await move(id, to);
    // Refusée : on la remet tout de suite, sans attendre le rechargement.
    if (!ok) {
      setMoved((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" data-testid="board-loading">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="prospection-screen">
      <div>
        <h1 className="text-xl font-semibold">{UI.TITLE}</h1>
        <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
          {UI.SUBTITLE}
        </p>
      </div>

      {/* Ce qui n'est pas au tableau, dit plutôt que tu. */}
      {hidden ? (
        <p
          data-testid="board-hidden-column"
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
          <Info className="size-4 shrink-0" />
          {UI.HIDDEN_COLUMN(hidden.meta.total)}
          {hidden.meta.total > 0 ? (
            <Link
              to={`/${projectId}/organizations?salesStatus=${HIDDEN}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {UI.HIDDEN_COLUMN_LINK}
            </Link>
          ) : null}
        </p>
      ) : null}

      <Kanban<Card>
        value={value}
        onValueChange={() => {
          /* L'état d'affichage vient du serveur : on ne le réécrit pas ici,
             `onMove` s'en charge et le rechargement fait foi. */
        }}
        getItemValue={(card) => card.id}
        onMove={({ activeContainer, overContainer, event }) => {
          if (!canMove) return;
          if (activeContainer === overContainer) return;
          void onMove(String(event.active.id), overContainer as SalesStatus);
        }}
      >
        <KanbanBoard className="flex gap-3 overflow-x-auto pb-2">
          {shown.map((column) => (
            /* Pas de `disabled` ici : il coupe aussi la **zone de dépôt** —
               `useSortable` refuse alors la carte — et grise la colonne. Une
               colonne n'est de toute façon pas déplaçable sans
               `KanbanColumnHandle`, que l'ordre du pipeline interdit. */
            <KanbanColumn
              key={column.salesStatus}
              value={column.salesStatus}
              className={cn(
                'w-64 shrink-0 rounded-lg border border-border bg-muted/40 p-2.5 transition-colors',
                // Seule la colonne survolée s'allume : teinter les cinq ne
                // dirait pas où la carte va tomber.
                'data-[over=true]:border-primary data-[over=true]:bg-primary/10',
              )}
            >
              <div className="mb-0.5 flex items-center gap-2">
                <b className="text-sm">
                  {SALES_STATUS_LABELS[column.salesStatus]}
                </b>
                <Badge variant="secondary" appearance="outline" size="sm">
                  {column.meta.total}
                </Badge>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {UI.COLUMN_HINTS[column.salesStatus]}
              </p>

              {/* Les cartes se rendent depuis `value`, pas depuis les données
                  du serveur : c'est lui qui porte le déplacement en attente.
                  Rendre `column.items` laissait la carte dans son ancienne
                  colonne jusqu'au rechargement. */}
              <KanbanColumnContent value={column.salesStatus}>
                {(value[column.salesStatus] ?? []).length === 0 ? (
                  <p
                    data-testid={`board-empty-${column.salesStatus}`}
                    className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted-foreground"
                  >
                    {UI.EMPTY_COLUMN}
                  </p>
                ) : (
                  (value[column.salesStatus] ?? []).map((card) => (
                    <KanbanItem
                      key={card.id}
                      value={card.id}
                      // Le serveur refuserait le déplacement d'une carte hors
                      // périmètre : on ne le propose pas.
                      disabled={!canMove || card.access === 'RESTRICTED'}
                    >
                      {/* `KanbanItem` ne pose que les attributs : les
                          écouteurs de glissement partent dans son contexte et
                          n'atteignent l'élément que par cette poignée. Sans
                          elle, rien n'est saisissable. La carte entière la
                          porte, comme dans la V8. */}
                      <KanbanItemHandle asChild>
                        <div>
                          <BoardCard card={card} onOpen={openPanel} />
                        </div>
                      </KanbanItemHandle>
                    </KanbanItem>
                  ))
                )}
              </KanbanColumnContent>

              {/* Une colonne se déroule sans recharger les quatre autres. */}
              {column.items.length < column.meta.total ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  disabled={loadingMore === column.salesStatus}
                  data-testid={`board-more-${column.salesStatus}`}
                  onClick={() => void loadMore(column.salesStatus)}
                >
                  {loadingMore === column.salesStatus
                    ? UI.LOADING_MORE
                    : UI.LOAD_MORE(column.items.length, column.meta.total)}
                </Button>
              ) : null}
            </KanbanColumn>
          ))}
        </KanbanBoard>

        {/* Sans enfants, `KanbanOverlay` rend une boîte vide : rien ne suit
            le curseur, et le geste paraît sans effet.

            `dropAnimation={null}` : l'animation par défaut ramène la carte
            flottante vers sa colonne **d'origine** avant de s'effacer — on la
            voyait donc revenir en arrière alors qu'elle est déjà rendue à sa
            nouvelle place. Sans elle, la surimpression s'efface et la carte
            est là où on l'a lâchée. */}
        <KanbanOverlay dropAnimation={null}>
          {({ value }) => {
            const card = shown
              .flatMap((c) => c.items)
              .find((i) => i.id === value);
            return card ? (
              <BoardCard card={card} onOpen={() => {}} floating />
            ) : null;
          }}
        </KanbanOverlay>
      </Kanban>

      <BoardCloseWindow
        card={closing?.card ?? null}
        onOpenChange={(open) => !open && setClosing(null)}
        onConfirm={async (reason) => {
          if (!closing) return;
          const id = closing.card.id;
          setClosing(null);
          setMoved((prev) => ({ ...prev, [id]: 'CLOSED' }));
          const ok = await move(id, 'CLOSED', reason);
          if (!ok) {
      setMoved((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
        }}
      />

      <OrganizationPanel
        organizationId={openedId}
        onOpenChange={(open) => !open && closePanel()}
      />
    </div>
  );
}
