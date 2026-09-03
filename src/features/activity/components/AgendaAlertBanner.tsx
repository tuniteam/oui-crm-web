import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AGENDA_BANNER } from '../constants/agenda.constants';
import type { AgendaItem } from '../types/agenda';
import { daysFromToday } from '../utils/activity-date';

type Props = {
  late: AgendaItem[];
  today: AgendaItem[];
  onOpen: (event: AgendaItem) => void;
  onSeeAll: () => void;
};

/** Au-delà, le bandeau deviendrait la page : on renvoie vers la liste. */
const MAX_SHOWN = 3;

/**
 * Ce qui presse, en tête d'agenda — L1 · US-01-09.
 *
 * Il se calcule sur la **même réponse** que la grille, sans requête
 * supplémentaire : `isLate` vient du serveur, la date du jour est une
 * comparaison de chaînes. Rien ne s'affiche quand il n'y a rien qui presse —
 * un bandeau permanent cesse d'être un signal.
 */
export function AgendaAlertBanner({ late, today, onOpen, onSeeAll }: Props) {
  if (late.length === 0 && today.length === 0) return null;

  const shown = [...late, ...today].slice(0, MAX_SHOWN);
  const hidden = late.length + today.length - shown.length;

  return (
    <div
      data-testid="agenda-banner"
      className="rounded-lg border border-destructive/40 bg-destructive/5 p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <TriangleAlert className="size-4 shrink-0 text-destructive" />
          {AGENDA_BANNER.SUMMARY(late.length, today.length)}
        </p>
        <Button
          variant="outline"
          size="sm"
          data-testid="agenda-banner-see-all"
          onClick={onSeeAll}
        >
          {AGENDA_BANNER.SEE_ALL}
        </Button>
      </div>

      <ul className="mt-2 space-y-1">
        {shown.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              data-testid={`agenda-banner-event-${e.id}`}
              onClick={() => onOpen(e)}
              className="w-full truncate rounded-md px-2 py-1 text-start text-sm hover:bg-muted"
            >
              {AGENDA_BANNER.LINE(
                e.time,
                e.title,
                e.organization.name,
                e.isLate ? Math.abs(daysFromToday(e.date) ?? 0) : null,
              )}
            </button>
          </li>
        ))}
      </ul>

      {hidden > 0 ? (
        <p className="mt-1 px-2 text-xs text-muted-foreground">
          {AGENDA_BANNER.MORE(hidden)}
        </p>
      ) : null}
    </div>
  );
}
