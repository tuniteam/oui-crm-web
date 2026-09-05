import { Badge } from '@/components/ui/badge';
import { toneOf } from '@/shared/constants/tone';
import {
  AGENDA_HORIZON_ACCENTS,
  AGENDA_HORIZON_LABELS,
  AGENDA_HORIZON_TONES,
  AGENDA_LIST_WINDOW_HINT,
  AGENDA_UI,
} from '../constants/agenda.constants';
import {
  AGENDA_HORIZONS,
  type AgendaHorizon,
  type AgendaItem,
  type AgendaState,
} from '../types/agenda';
import { horizonOf } from '../utils/agenda-horizon';
import { AgendaEventRow } from './AgendaEventRow';

type Props = {
  events: AgendaItem[];
  onOpen: (event: AgendaItem) => void;
  /* Le filtre actif : c'est lui qui decide ce que dit une liste vide. */
  state: AgendaState;
};

/**
 * La liste, groupée par urgence — L1 · US-01-09.
 *
 * Grouper par jour situait les actions sans les hiérarchiser : une action en
 * retard apparaissait sous sa date, comme n'importe quelle autre, et « À
 * faire » semblait ne pas filtrer. Le groupement par horizon dit **pourquoi**
 * chaque ligne est là — et « En retard » reste dans « À faire », puisqu'une
 * action en retard est justement celle qu'il faut traiter.
 */
export function AgendaList({ events, onOpen, state }: Props) {
  if (events.length === 0) {
    return (
      <div
        data-testid="agenda-empty"
        className="rounded-lg border border-dashed border-border px-4 py-10 text-center"
      >
        <p className="text-sm font-semibold">{AGENDA_UI.EMPTY[state].TITLE}</p>
        <p className="mx-auto mt-1 max-w-[55ch] text-sm text-muted-foreground">
          {AGENDA_UI.EMPTY[state].DESCRIPTION}
        </p>
      </div>
    );
  }

  const groups = new Map<AgendaHorizon, AgendaItem[]>();
  for (const e of events) {
    const key = horizonOf(e);
    const list = groups.get(key);
    if (list) list.push(e);
    else groups.set(key, [e]);
  }

  return (
    <div className="space-y-6" data-testid="agenda-list">
      {AGENDA_HORIZONS.filter((h) => groups.has(h)).map((horizon) => {
        const items = groups.get(horizon) ?? [];
        /* L'historique se lit du plus récent au plus ancien — ce qu'on vient
           de faire d'abord. Le reste va vers l'avenir. */
        const sorted = [...items].sort((a, b) =>
          horizon === 'done'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date),
        );

        return (
          <div key={horizon} className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              {AGENDA_HORIZON_LABELS[horizon]}
              <Badge
                variant={toneOf(AGENDA_HORIZON_TONES, horizon)}
                appearance="outline"
                data-testid={`agenda-group-${horizon}`}
              >
                {/* Un compteur, pas un etat : pas de point.
                    Voir `docs/REGLE-BADGE-VS-BOUTON.md`. */}
                {sorted.length}
              </Badge>
            </p>
            {sorted.map((e) => (
              <AgendaEventRow
                key={e.id}
                event={e}
                onOpen={onOpen}
                showDate
                accent={AGENDA_HORIZON_ACCENTS[horizon]}
              />
            ))}
          </div>
        );
      })}

      {/* Sans cette phrase, on chercherait pourquoi la liste ne suit pas les
          flèches de période. */}
      <p className="text-xs text-muted-foreground">{AGENDA_LIST_WINDOW_HINT}</p>
    </div>
  );
}
