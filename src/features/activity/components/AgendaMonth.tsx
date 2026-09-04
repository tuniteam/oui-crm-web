import { cn } from '@/lib/utils';
import {
  AGENDA_HORIZON_SURFACES,
  AGENDA_UI,
} from '../constants/agenda.constants';
import type { AgendaItem } from '../types/agenda';
import {
  dayNumber,
  isSameMonth,
  monthGrid,
  todayDay,
} from '../utils/agenda-month';
import { horizonOf } from '../utils/agenda-horizon';
import { AgendaEventRow } from './AgendaEventRow';

/** Au-delà, la cellule pousserait toute la ligne : un « +N » et on bascule. */
const MAX_PER_CELL = 3;

type Props = {
  cursor: string;
  events: AgendaItem[];
  onOpen: (event: AgendaItem) => void;
  /** Voir tout un jour : la liste répond mieux qu'une cellule qui déborde. */
  onSeeDay: (day: string) => void;
};

/** La grille du mois — L1 · US-01-09. Lecture seule : rien ne s'y déplace. */
export function AgendaMonth({ cursor, events, onOpen, onSeeDay }: Props) {
  const weeks = monthGrid(cursor);
  const today = todayDay();

  // Les jours sont des chaines : le regroupement n'a besoin d'aucune `Date`.
  const byDay = new Map<string, AgendaItem[]>();
  for (const e of events) {
    const list = byDay.get(e.date);
    if (list) list.push(e);
    else byDay.set(e.date, [e]);
  }

  return (
    /*
     * La grille est un objet, pas un fond de page : une carte bordee et ombree,
     * posee sur le gris de l'ecran. Sans cette limite, le calendrier se
     * confondait avec la barre d'outils au-dessus.
     */
    <div
      data-testid="agenda-month"
      className="overflow-x-auto overflow-hidden rounded-lg border border-border bg-card shadow-xs"
    >
      <div className="min-w-[52rem]">
        <div
          data-slot="calendar-grid"
          className="grid grid-cols-7 border-b border-border bg-muted/50"
        >
          {AGENDA_UI.WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div
            key={week[0]}
            data-slot="calendar-grid"
            className="grid grid-cols-7"
          >
            {week.map((day) => {
              const list = (byDay.get(day) ?? []).slice();
              // Tri par heure ; une action sans heure ouvre la journee.
              list.sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
              const shown = list.slice(0, MAX_PER_CELL);
              const hidden = list.length - shown.length;

              return (
                <div
                  key={day}
                  data-testid={`agenda-day-${day}`}
                  className={cn(
                    'min-h-28 space-y-1 border-b border-e border-border p-1.5 last:border-e-0',
                    /*
                     * Les jours voisins forment un bloc gris continu. Le filet
                     * vertical y devient transparent : sur un fond gris, un
                     * filet plus clair que lui se lit comme un trait blanc — ce
                     * qui decoupait la zone au lieu de la mettre en retrait.
                     * Pas d'`opacity` non plus : elle delavait aussi le filet.
                     */
                    !isSameMonth(day, cursor) &&
                      'bg-muted-foreground/10 border-e-muted-foreground/10 text-muted-foreground/70',
                    // Aujourd'hui se repere de loin : la pastille du numero ne
                    // suffit pas sur une grille de trente-cinq cases.
                    day === today && 'bg-primary/5',
                  )}
                >
                  <div
                    className={cn(
                      'text-xs',
                      day === today
                        ? 'inline-flex size-5 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground'
                        : isSameMonth(day, cursor)
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    {dayNumber(day)}
                  </div>

                  {shown.map((e) => (
                    <AgendaEventRow
                      key={e.id}
                      event={e}
                      onOpen={onOpen}
                      compact
                      accent={AGENDA_HORIZON_SURFACES[horizonOf(e)]}
                    />
                  ))}

                  {hidden > 0 ? (
                    <button
                      type="button"
                      data-testid={`agenda-more-${day}`}
                      onClick={() => onSeeDay(day)}
                      className="w-full rounded-md px-2 py-0.5 text-start text-xs text-primary hover:bg-muted"
                    >
                      {AGENDA_UI.MORE(hidden)}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
