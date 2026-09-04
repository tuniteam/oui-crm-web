import { Lock, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toneOf } from '@/shared/constants/tone';
import {
  daysFromToday,
  formatDayFr,
  isLate,
} from '@/features/activity/utils/activity-date';
import { BOARD_UI } from '../constants/board.constants';
import {
  PRIORITY_LABELS,
  PRIORITY_TONES,
} from '../constants/organizationList.constants';
import type { BoardCard as Card } from '../types/board';

const UI = BOARD_UI;

/**
 * Les initiales d'un commercial.
 *
 * Le serveur rend `initials: null` sur les comptes du jeu de demonstration :
 * s'en remettre a lui laisserait une pastille vide sur **toutes** les cartes,
 * et on ne distinguerait plus « personne n'est affecte » de « quelqu'un l'est ».
 * On derive donc du nom complet a defaut.
 */
function initialsOf(rep: Card['salesRep']): string {
  if (!rep) return '—';
  if (rep.initials) return rep.initials;
  const parts = rep.fullName.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '')
  ).toUpperCase() || '?';
}

/** Ce qui peut etre coupe se lit au survol : une colonne fait 250 pixels. */
function Truncated({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('block truncate', className)}>{children}</span>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

type Props = {
  card: Card;
  onOpen: (id: string) => void;
  /** Rendue dans la surimpression qui suit le curseur, pas dans la colonne. */
  floating?: boolean;
};

/**
 * Une carte du tableau — L1 · US-01-10, variante D.
 *
 * **Le prochain geste en tête, le nom dessous, les initiales à droite.** Un
 * tableau de prospection répond « qu'est-ce qui bouge » : mettre l'action en
 * premier fait ressortir les fiches qui avancent.
 *
 * L'absence, elle, se dit **en retrait** — deux fiches sur dix ont une action
 * planifiée, et une absence criée sur les huit autres noierait les deux qui
 * parlent.
 *
 * Une carte hors périmètre est **réduite par le serveur** : ni priorité, ni
 * étiquettes, ni prochaine action. Elle reste visible, grisée, et son
 * déplacement est désactivé — le serveur le refuserait de toute façon.
 */
export function BoardCard({ card, onOpen, floating = false }: Props) {
  const restricted = card.access === 'RESTRICTED';
  const next = card.nextActivity ?? null;
  /* `date` est une chaîne de jour, jamais un instant : on la lit telle quelle,
     ce qui évite le décalage de fuseau de `nextActivityAt`. */
  const late = next ? isLate(next.date) : false;
  const lateDays = next && late ? Math.abs(daysFromToday(next.date) ?? 0) : 0;

  const nextLine = next
    ? [formatDayFr(next.date), next.time, next.title, late ? UI.LATE(lateDays) : null]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <div
      data-testid={`board-card-${card.id}`}
      onClick={() => onOpen(card.id)}
      className={cn(
        'group/card relative rounded-lg border bg-background p-2.5 text-start',
        restricted
          ? 'cursor-not-allowed border-dashed border-border opacity-70'
          : 'border-border hover:border-primary/40 hover:shadow-sm',
        // Ce qui suit le curseur : soulevé, incliné, opaque.
        floating && 'rotate-2 border-primary/50 shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 grow">
          {restricted ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3" />
              {UI.RESTRICTED}
            </p>
          ) : nextLine ? (
            <p
              data-testid={`board-next-${card.id}`}
              className={cn(
                'flex items-center gap-1 font-mono text-[11px]',
                late ? 'font-semibold text-destructive' : 'text-primary',
              )}
            >
              {late ? <TriangleAlert className="size-3 shrink-0" /> : null}
              <Truncated title={nextLine}>{nextLine}</Truncated>
            </p>
          ) : (
            /* Le silence, en retrait : ni chasse fixe ni couleur, pour ne pas
               concurrencer les dates réelles. */
            <p
              data-testid={`board-next-${card.id}`}
              className="truncate text-[11px] italic text-muted-foreground/70"
            >
              {UI.NO_NEXT_ACTIVITY}
            </p>
          )}

          <Truncated title={card.name} className="mt-0.5 text-sm font-medium">
            {card.name}
          </Truncated>
        </div>

        {/* Deux lettres remplacent un nom : le survol le rend. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              data-testid={`board-rep-${card.id}`}
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                card.salesRep
                  ? 'bg-primary/10 text-primary'
                  : 'border border-dashed border-border text-muted-foreground',
              )}
            >
              {initialsOf(card.salesRep)}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {card.salesRep?.fullName ?? UI.UNASSIGNED}
          </TooltipContent>
        </Tooltip>
      </div>

      {!restricted && (card.priority || (card.tags ?? []).length > 0) ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {card.priority ? (
            <Badge
              variant={toneOf(PRIORITY_TONES, card.priority)}
              appearance="outline"
              size="sm"
            >
              {PRIORITY_LABELS[card.priority]}
            </Badge>
          ) : null}
          {(card.tags ?? []).map((tag) => (
            /* Les étiquettes sont des clés d'import brutes : une seule
               `COMPETITOR_RENEWAL` pousserait les autres hors de la carte. */
            <Tooltip key={tag}>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  appearance="outline"
                  size="sm"
                  className="max-w-28 truncate"
                >
                  {tag}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>{UI.TAG_TOOLTIP(tag)}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      ) : null}
    </div>
  );
}
