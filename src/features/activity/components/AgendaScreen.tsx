import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
import { FILTER_ALL, PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/features/user/hooks/useUsers';
import { OrganizationPanel } from '@/features/organization/components/OrganizationPanel';
import { ORGANIZATIONS_UI } from '@/features/organization/constants/organizationList.constants';
import { AGENDA_UI, type AgendaView } from '../constants/agenda.constants';
import { useActivityReference } from '../hooks/useActivityReference';
import { useAgenda } from '../hooks/useAgenda';
import {
  AGENDA_STATE_MATCHES,
  type AgendaItem,
  type AgendaKind,
  type AgendaState,
} from '../types/agenda';
import {
  monthBounds,
  shiftMonth,
  slidingWindow,
  todayDay,
} from '../utils/agenda-month';
import { ActivityWindow } from './ActivityWindow';
import { AgendaAlertBanner } from './AgendaAlertBanner';
import { AgendaList } from './AgendaList';
import { AgendaMonth } from './AgendaMonth';
import { AgendaSources } from './AgendaSources';
import { AgendaToolbar } from './AgendaToolbar';

const UI = AGENDA_UI;

/**
 * L'agenda rend le **libelle** du type dans `title`, jamais sa cle : c'est par
 * lui qu'il faut comparer. Le contrat ne porte pas la cle sur un creneau —
 * meme manque que pour l'export ICS.
 */
const typeLabel = (
  types: { key: string; label: string }[],
  key: string,
): string | null => types.find((t) => t.key === key)?.label ?? null;

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
  // « À faire » d'entrée : c'est la question que l'écran doit servir.
  const [state, setState] = useState<AgendaState>('todo');
  const [type, setType] = useState<string>(FILTER_ALL);
  const [planning, setPlanning] = useState(false);
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
  const canCreate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ACTIVITIES.CREATE),
  );
  const { users } = useUsers({ page: 1, limit: 100 }, canFilterByUser);

  const { types } = useActivityReference();

  /*
   * La grille regarde un mois ; la liste regarde une **fenetre glissante**.
   *
   * Grouper par urgence n'a de sens que si l'urgence est dans la fenetre : un
   * commercial qui ouvre l'agenda le 28 doit voir la semaine suivante, qui
   * n'est pas dans le mois affiche. `from` et `to` etant libres au contrat,
   * c'est un choix d'interface, pas une contrainte.
   */
  const { from, to } = useMemo(
    () => (view === 'list' ? slidingWindow() : monthBounds(cursor)),
    [view, cursor],
  );
  const { events, counts, loading } = useAgenda({
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
  /*
   * L'état et le type se filtrent ici, pas au serveur : la route n'accepte ni
   * `status` ni `type`, et la période entière est chargée avant d'être peinte.
   * Rien n'est masqué que le serveur n'ait déjà rendu.
   */
  const shown = events.filter(
    (e) =>
      AGENDA_STATE_MATCHES[state](e) &&
      (type === FILTER_ALL || e.title === typeLabel(types, type)),
  );

  /* Le bandeau reste **absolu** : le retard ne disparaît pas parce qu'on
     regarde un autre type ou l'historique. */
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{UI.TITLE}</h1>
          <p className="mt-1 max-w-[80ch] text-sm text-muted-foreground">
            {UI.SUBTITLE}
          </p>
        </div>

        {/* Depuis l'agenda, aucune fiche n'est en contexte : la fenêtre
            commence par demander l'organisme. */}
        {canCreate ? (
          <Button data-testid="agenda-add" onClick={() => setPlanning(true)}>
            <CirclePlus className="size-4" />
            {UI.ADD}
          </Button>
        ) : null}
      </div>

      <AgendaAlertBanner
        late={late}
        today={dueToday}
        onOpen={open}
        onSeeAll={() => {
          setView('list');
          setState('late');
        }}
      />

      <AgendaToolbar
        showPeriod={view === 'month'}
        cursor={cursor}
        onShiftMonth={(delta) => setCursor((c) => shiftMonth(c, delta))}
        onToday={() => setCursor(todayDay())}
        view={view}
        onView={setView}
        state={state}
        onState={setState}
        type={type}
        onType={setType}
        types={types}
        users={canFilterByUser ? users : null}
        userId={userId}
        onUserId={setUserId}
      />

      <AgendaSources counts={counts} shown={shown.length} />

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : view === 'month' ? (
        <AgendaMonth
          cursor={cursor}
          events={shown}
          onOpen={open}
          onSeeDay={() => setView('list')}
        />
      ) : (
        <AgendaList events={shown} onOpen={open} />
      )}

      <ActivityWindow
        open={planning}
        onOpenChange={(next) => {
          setPlanning(next);
          // Une action planifiée depuis ici doit apparaître dans la grille.
          if (!next) {
            queryClient.invalidateQueries({ queryKey: ['agenda'], exact: false });
          }
        }}
        activity={null}
      />

      <OrganizationPanel
        organizationId={openedId}
        onOpenChange={(next) => !next && closePanel()}
      />

    </div>
  );
}
