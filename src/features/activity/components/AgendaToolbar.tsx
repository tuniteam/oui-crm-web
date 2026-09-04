import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FILTER_ALL } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActivityTypeOption } from '../hooks/useActivityReference';
import {
  AGENDA_UI,
  AGENDA_VIEWS,
  type AgendaView,
} from '../constants/agenda.constants';
import { AGENDA_STATES, type AgendaState } from '../types/agenda';
import { monthLabel } from '../utils/agenda-month';
import type { UserListItem } from '@/features/user/types/userList';

const UI = AGENDA_UI;

type Props = {
  /** La vue Liste couvre une fenêtre glissante : le curseur n'y sert à rien. */
  showPeriod: boolean;
  cursor: string;
  onShiftMonth: (delta: number) => void;
  onToday: () => void;

  view: AgendaView;
  onView: (view: AgendaView) => void;

  state: AgendaState;
  onState: (state: AgendaState) => void;

  type: string;
  onType: (type: string) => void;
  types: ActivityTypeOption[];

  /** Absent en portée `OWN` : le serveur y refuserait un autre collaborateur. */
  users: UserListItem[] | null;
  userId: string;
  onUserId: (userId: string) => void;
};

/** Un segment de boutons, comme la V8 : un seul choix visible à la fois. */
function Segment<T extends string>({
  values,
  labels,
  current,
  onPick,
  testId,
}: {
  values: readonly T[];
  labels: Record<T, string>;
  current: T;
  onPick: (value: T) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      {values.map((v) => (
        <Button
          key={v}
          size="sm"
          variant={current === v ? 'primary' : 'ghost'}
          data-testid={`${testId}-${v}`}
          onClick={() => onPick(v)}
        >
          {labels[v]}
        </Button>
      ))}
    </div>
  );
}

/**
 * La barre de l'agenda — L1 · US-01-09.
 *
 * Période, vue, état, et les deux filtres. Seule la période et le
 * collaborateur partent au serveur : la route n'accepte ni `status` ni
 * `type`, et l'état comme le type se calculent sur la période déjà chargée.
 */
export function AgendaToolbar({
  showPeriod,
  cursor,
  onShiftMonth,
  onToday,
  view,
  onView,
  state,
  onState,
  type,
  onType,
  types,
  users,
  userId,
  onUserId,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showPeriod ? (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-label={UI.PREVIOUS}
          data-testid="agenda-prev"
          onClick={() => onShiftMonth(-1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span
          data-testid="agenda-period"
          className="min-w-40 text-center text-sm font-medium"
        >
          {monthLabel(cursor)}
        </span>
        <Button
          variant="outline"
          size="sm"
          aria-label={UI.NEXT}
          data-testid="agenda-next"
          onClick={() => onShiftMonth(1)}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="agenda-today"
          onClick={onToday}
        >
          {UI.TODAY}
        </Button>
      </div>
      ) : null}

      <div className="ms-auto flex flex-wrap items-center gap-2">
        {users ? (
          <Select value={userId} onValueChange={onUserId}>
            <SelectTrigger data-testid="agenda-user" className="w-52">
              <SelectValue placeholder={UI.FILTERS.USER_ALL} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FILTER_ALL}>{UI.FILTERS.USER_ALL}</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {[u.firstName, u.lastName].filter(Boolean).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {/* Le type ne part pas au serveur : la route ne l'accepte pas, et la
            période entière est déjà chargée. */}
        <Select value={type} onValueChange={onType}>
          <SelectTrigger data-testid="agenda-type" className="w-48">
            <SelectValue placeholder={UI.FILTERS.TYPE_ALL}>
              {type === FILTER_ALL
                ? UI.FILTERS.TYPE_ALL
                : types.find((t) => t.key === type)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_ALL}>{UI.FILTERS.TYPE_ALL}</SelectItem>
            {types.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Segment
          values={AGENDA_STATES}
          labels={UI.STATES}
          current={state}
          onPick={onState}
          testId="agenda-state"
        />

        <Segment
          values={AGENDA_VIEWS}
          labels={UI.VIEWS}
          current={view}
          onPick={onView}
          testId="agenda-view"
        />
      </div>
    </div>
  );
}
