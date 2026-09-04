import { TriangleAlert } from 'lucide-react';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AGENDA_UI } from '../constants/agenda.constants';
import { formatDayFr } from '../utils/activity-date';
import type { AgendaItem } from '../types/agenda';

type Props = {
  event: AgendaItem;
  onOpen: (event: AgendaItem) => void;
  /** Forme dense pour les cellules du mois, aérée pour la liste. */
  compact?: boolean;
  /** La liste groupe par urgence, pas par jour : la date doit être portée. */
  showDate?: boolean;
  /**
   * Le traitement de couleur du groupe qui porte la ligne : un filet seul dans
   * la liste, filet et fond dans une cellule du mois, trop dense pour le filet
   * seul. Voir `AGENDA_HORIZON_ACCENTS` et `AGENDA_HORIZON_SURFACES`.
   */
  accent?: string;
};

/**
 * Un événement de l'agenda — L1 · US-01-09.
 *
 * `isLate` vient du serveur et n'est jamais recalculé : c'est le seul signal
 * d'alerte de l'écran, et un calcul local divergerait d'un fuseau. `status`
 * distingue ce qui est fait de ce qui est à faire.
 */
export function AgendaEventRow({
  event,
  onOpen,
  compact = false,
  showDate = false,
  accent,
}: Props) {
  const done = event.status === 'DONE';

  return (
    <button
      type="button"
      data-testid={`agenda-event-${event.id}`}
      onClick={() => onOpen(event)}
      className={cn(
        'w-full rounded-md border px-2 py-1 text-start transition-colors hover:bg-muted',
        compact ? 'text-xs' : 'flex items-center gap-3 px-3 py-2 text-sm',
        event.isLate
          ? 'border-destructive/40 bg-destructive/5'
          : 'border-border',
        accent ? `border-s-[3px] ${accent}` : '',
        // Ce qui est fait passe au second plan sans disparaître.
        done && 'opacity-60',
      )}
    >
      {event.isLate ? (
        <TriangleAlert
          className={cn('shrink-0 text-destructive', compact ? 'inline size-3' : 'size-4')}
          aria-label={AGENDA_UI.LATE}
        />
      ) : null}

      {/* L'heure est affichée telle quelle : la reconstruire en `Date`
          décalerait tous les rendez-vous d'un fuseau. */}
      {/* Jour et heure lus tels quels : rien ne se reconstruit en `Date`. */}
      <span
        className={cn(
          'font-mono tabular-nums',
          compact ? 'me-1' : showDate ? 'w-28 shrink-0' : 'w-12 shrink-0',
        )}
      >
        {showDate ? `${formatDayFr(event.date)} ` : ''}
        {event.time ?? ''}
      </span>

      <span className={cn('min-w-0', compact ? 'inline' : 'grow')}>
        <span className={cn('block truncate', !compact && 'font-medium')}>
          {event.title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {event.organization.name}
          {event.subtitle && !compact ? ` · ${event.subtitle}` : ''}
        </span>
      </span>

      {!compact && done ? (
        <Badge variant="success" appearance="outline" size="sm">
          <BadgeDot />
          {AGENDA_UI.DONE}
        </Badge>
      ) : null}

      {!compact && event.user ? (
        <span className="shrink-0 text-xs text-muted-foreground">
          {event.user.fullName}
        </span>
      ) : null}
    </button>
  );
}
