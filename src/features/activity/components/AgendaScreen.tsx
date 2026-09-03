import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { FILTER_ALL, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/user/hooks/useUsers';
import { OrganizationPanel } from '@/features/organization/components/OrganizationPanel';
import { ORGANIZATIONS_UI } from '@/features/organization/constants/organizationList.constants';
import {
  AGENDA_UI,
  AGENDA_VIEWS,
  type AgendaView,
} from '../constants/agenda.constants';
import { useAgenda } from '../hooks/useAgenda';
import type { AgendaItem, AgendaKind } from '../types/agenda';
import {
  monthBounds,
  monthLabel,
  shiftMonth,
  todayDay,
} from '../utils/agenda-month';
import { AgendaAlertBanner } from './AgendaAlertBanner';
import { AgendaList } from './AgendaList';
import { AgendaMonth } from './AgendaMonth';

const UI = AGENDA_UI;

/**
 * Ce qu'un événement ouvre, selon sa source.
 *
 * **Sur place, pas ailleurs.** La cible s'écrit dans l'URL de l'agenda : un
 * `navigate()` vers le module Organismes ferait perdre le mois affiché et les
 * filtres dès qu'on referme la fiche, et un commercial qui dépouille son mois
 * action par action referme dix fois.
 *
 * Le contrat prévoit déjà quatre sources et une seule répond au L1. La
 * correspondance est écrite dès maintenant pour qu'ajouter une source soit une
 * ligne : un devis qui expire ouvrira le devis, et méritera sans doute une
 * vraie navigation plutôt qu'un panneau.
 */
const AGENDA_TARGETS: Record<
  AgendaKind,
  (event: AgendaItem) => Record<string, string> | null
> = {
  ACTIVITY: (e) => ({
    [ORGANIZATIONS_UI.PANEL_PARAM]: e.organization.id,
    [ORGANIZATIONS_UI.TAB_PARAM]: 'activities',
    [ORGANIZATIONS_UI.ANCHOR_PARAM]: e.id,
  }),
  // Lot L4 : la session de formation, pas la fiche.
  TRAINING: () => null,
  // Lot L3 : le contrat qui arrive à échéance.
  CONTRACT_END: () => null,
  // Lot L2 : le devis qui expire.
  QUOTE_EXPIRY: () => null,
};

/** Agenda — L1 · US-01-09. */
export default function AgendaScreen() {
  /*
   * La fiche ouverte vit dans l'URL de l'agenda : elle survit au
   * rafraichissement, le retour arriere la referme au lieu de changer de
   * module, et un lien profond rouvre la meme action au meme endroit.
   */
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const openedId = params.get(ORGANIZATIONS_UI.PANEL_PARAM);
  const [cursor, setCursor] = useState(todayDay);
  const [view, setView] = useState<AgendaView>('month');
  const [userId, setUserId] = useState<string>(FILTER_ALL);

  /*
   * En portée `OWN`, le serveur **ignore** `userId` : un sélecteur dont la
   * seule valeur possible est soi-même n'est pas un filtre, c'est un piège.
   * On le masque plutôt que de le désactiver — un champ grisé laisse une
   * question sans réponse à l'écran.
   */
  const scope = useMeStore((s) =>
    s.getPermissionScope(PERMISSIONS.ACTIVITIES.READ),
  );
  const canFilterByUser = scope === 'PROJECT' || scope === 'ALL';
  const { users } = useUsers({ page: 1, limit: 100 }, canFilterByUser);

  const { from, to } = useMemo(() => monthBounds(cursor), [cursor]);
  const { events, loading } = useAgenda({
    from,
    to,
    ...(canFilterByUser && userId !== FILTER_ALL ? { userId } : {}),
  });

  /*
   * Le bandeau ne montre que ce qui **reste à faire**.
   *
   * `isLate` vient du serveur — jamais recalculé, sous peine de diverger d'un
   * fuseau — et une action en retard est par construction planifiée. Du jour,
   * en revanche, il faut écarter ce qui est déjà réalisé : annoncer sous une
   * alerte rouge une action faite ce matin, c'est user le signal pour rien.
   */
  const today = todayDay();
  const late = events.filter((e) => e.isLate);
  const dueToday = events.filter(
    (e) => !e.isLate && e.date === today && e.status === 'PLANNED',
  );

  const open = (event: AgendaItem) => {
    const target = AGENDA_TARGETS[event.kind](event);
    if (!target) return;
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(target)) next.set(k, v);
        return next;
      },
      { replace: true },
    );
  };

  /**
   * Refermer efface les trois parametres, rend l'agenda intact — et **le
   * recharge**.
   *
   * La fiche s'ouvre par-dessus la grille : on y planifie, on y realise, on y
   * annule. Sans ce rechargement, l'utilisateur retrouve sous les yeux l'etat
   * d'avant ses propres ecritures. Le faire ici plutot qu'a chaque ecriture
   * evite aussi de recharger l'agenda a chaque frappe dans le panneau.
   */
  const closePanel = () => {
    queryClient.invalidateQueries({ queryKey: ['agenda'], exact: false });
    return
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(ORGANIZATIONS_UI.PANEL_PARAM);
        next.delete(ORGANIZATIONS_UI.TAB_PARAM);
        next.delete(ORGANIZATIONS_UI.ANCHOR_PARAM);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-4" data-testid="agenda-screen">
      <div>
        <h1 className="text-xl font-semibold">{UI.TITLE}</h1>
        <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
          {UI.SUBTITLE}
        </p>
      </div>

      <AgendaAlertBanner
        late={late}
        today={dueToday}
        onOpen={open}
        onSeeAll={() => setView('list')}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            aria-label={UI.PREVIOUS}
            data-testid="agenda-prev"
            onClick={() => setCursor((c) => shiftMonth(c, -1))}
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
            onClick={() => setCursor((c) => shiftMonth(c, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="agenda-today"
            onClick={() => setCursor(todayDay())}
          >
            {UI.TODAY}
          </Button>
        </div>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          {canFilterByUser ? (
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger data-testid="agenda-user" className="w-56">
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

          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            {AGENDA_VIEWS.map((v) => (
              <Button
                key={v}
                size="sm"
                variant={view === v ? 'primary' : 'ghost'}
                data-testid={`agenda-view-${v}`}
                onClick={() => setView(v)}
              >
                {UI.VIEWS[v]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : view === 'month' ? (
        <AgendaMonth
          cursor={cursor}
          events={events}
          onOpen={open}
          onSeeDay={() => setView('list')}
        />
      ) : (
        <AgendaList events={events} onOpen={open} />
      )}

      <OrganizationPanel
        organizationId={openedId}
        onOpenChange={(next) => !next && closePanel()}
      />

      {/* Trois des quatre sources du contrat n'ont pas encore de données. On
          le dit, plutôt que d'offrir des cases à cocher qui ne peuvent rien
          filtrer : un filtre inerte est un piège à clic. */}
      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {UI.SOURCES_HINT}
      </p>
    </div>
  );
}
