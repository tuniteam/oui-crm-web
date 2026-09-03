import { AGENDA_UI } from '../constants/agenda.constants';
import type { AgendaItem } from '../types/agenda';
import { dayLabel } from '../utils/agenda-month';
import { AgendaEventRow } from './AgendaEventRow';

type Props = {
  events: AgendaItem[];
  onOpen: (event: AgendaItem) => void;
};

/**
 * La même période en liste, groupée par jour — L1 · US-01-09.
 *
 * C'est la seule vue utilisable au téléphone, et celle qui rend le retard
 * exploitable : on lit une suite de choses à faire, pas une surface.
 */
export function AgendaList({ events, onOpen }: Props) {
  if (events.length === 0) {
    return (
      <div
        data-testid="agenda-empty"
        className="rounded-lg border border-dashed border-border px-4 py-10 text-center"
      >
        <p className="text-sm font-semibold">{AGENDA_UI.EMPTY.TITLE}</p>
        <p className="mx-auto mt-1 max-w-[55ch] text-sm text-muted-foreground">
          {AGENDA_UI.EMPTY.DESCRIPTION}
        </p>
      </div>
    );
  }

  // Le serveur trie deja par date puis heure : on regroupe sans retrier.
  const days: { day: string; items: AgendaItem[] }[] = [];
  for (const e of events) {
    const last = days[days.length - 1];
    if (last && last.day === e.date) last.items.push(e);
    else days.push({ day: e.date, items: [e] });
  }

  return (
    <div className="space-y-5" data-testid="agenda-list">
      {days.map(({ day, items }) => (
        <div key={day} className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {dayLabel(day)}
          </p>
          {items.map((e) => (
            <AgendaEventRow key={e.id} event={e} onOpen={onOpen} />
          ))}
        </div>
      ))}
    </div>
  );
}
