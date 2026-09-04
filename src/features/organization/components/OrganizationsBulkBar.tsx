import { useMemo, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCampaigns } from '@/features/campaign/hooks/useCampaigns';
import { useUsers } from '@/features/user/hooks/useUsers';
import {
  BULK_ACTION_LABELS,
  BULK_MAX_IDS,
  BULK_FIELDS,
  BULK_OPTIONS_LIMIT,
  BULK_UI as UI,
} from '../constants/bulk.constants';
import {
  PRIORITY_LABELS,
  SALES_STATUS_LABELS,
} from '../constants/organizationList.constants';
import { useBulkActions } from '../hooks/useBulkActions';
import { BULK_ACTIONS, type BulkAction, type BulkFilters } from '../types/bulk';
import { PRIORITY_VALUES, SALES_STATUS_VALUES } from '../types/organizationList';
import { BulkActionWindow } from './BulkActionWindow';

type Option = { value: string; label: string };

type Props = {
  /** Les identifiants cochés, toutes pages confondues. */
  ids: string[];
  /** Combien de fiches le filtre courant ramène, tous écrans confondus. */
  total: number;
  /** Les filtres de la liste, tels qu'elle les a envoyés au serveur. */
  filters: BulkFilters;
  onClear: () => void;
  /**
   * L'action exécutée, et l'étendue sur laquelle elle a porté. La table en a
   * besoin : une suppression groupée peut emporter la fiche ouverte.
   */
  onDone: (done: {
    action: BulkAction;
    ids: string[];
    allMatching: boolean;
  }) => void;
};

/**
 * La barre d'actions groupées — L1 · US-01-05.
 *
 * **Une seule commande visible.** Le double sélecteur et son bouton
 * « Appliquer » grisé demandaient trois gestes et encombraient la barre ; ici
 * un menu nomme les cinq actions, et chacune ouvre sa fenêtre. C'est le motif
 * que le reste de l'application emploie déjà, et il rappelle l'étendue **au
 * moment de valider** — pas dans une barre qu'on a cessé de lire.
 *
 * **Deux sélections, pas une.** Cocher l'en-tête ne coche que la page affichée :
 * la table ne voit pas au-delà. Le contrat, lui, sait agir sur tout ce qui
 * correspond aux filtres, sans énumérer les identifiants. Confondre les deux
 * ferait supprimer vingt fiches en croyant en supprimer quatre cents — d'où le
 * second geste, et un **bouton** plutôt qu'un lien : ce qui se clique en a la
 * forme.
 */
export function OrganizationsBulkBar({
  ids,
  total,
  filters,
  onClear,
  onDone,
}: Props) {
  const [allMatching, setAllMatching] = useState(false);
  /** L'action dont la fenêtre est ouverte, ou `null`. */
  const [action, setAction] = useState<BulkAction | null>(null);

  // Le commercial a `bulk` mais pas `delete` : l'action disparaît plutôt que
  // d'échouer après le clic.
  const canDelete = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.ORGANIZATIONS.DELETE),
  );

  const field = action ? BULK_FIELDS[action] : null;
  const source = field?.needsValue ? field.source : null;

  /* Deux listes distantes, chacune chargée seulement quand son action est
     choisie : ouvrir la barre ne doit pas appeler l'API pour rien. */
  const { users } = useUsers(
    { page: 1, limit: BULK_OPTIONS_LIMIT },
    source === 'users',
  );
  const { campaigns } = useCampaigns(
    { limit: BULK_OPTIONS_LIMIT },
    source === 'campaigns',
  );
  const bulk = useBulkActions();

  const actions = BULK_ACTIONS.filter((a) => a !== 'DELETE' || canDelete);
  const count = allMatching ? total : ids.length;

  /*
   * Au-delà de 500 identifiants le serveur refuse (`400 INVALID_DATA`), et le
   * plafond est atteignable : la sélection persiste d'une page à l'autre.
   * `selectAll` n'énumère rien, il n'est donc jamais concerné.
   */
  const tooMany = !allMatching && ids.length > BULK_MAX_IDS;

  const options = useMemo<Option[]>(() => {
    switch (source) {
      case 'users':
        return users.map((u) => ({
          value: u.id,
          label: [u.firstName, u.lastName].filter(Boolean).join(' '),
        }));
      case 'campaigns':
        return campaigns.map((c) => ({ value: c.id, label: c.name }));
      case 'salesStatus':
        return SALES_STATUS_VALUES.map((v) => ({
          value: v,
          label: SALES_STATUS_LABELS[v],
        }));
      case 'priority':
        return PRIORITY_VALUES.map((v) => ({
          value: v,
          label: PRIORITY_LABELS[v],
        }));
      default:
        return [];
    }
  }, [source, users, campaigns]);

  const apply = async (payload: Parameters<typeof bulk.run>[0]['payload']) => {
    if (!action || tooMany) return;
    const result = await bulk.run({
      action,
      payload,
      /* `selectAll` rejoue **les filtres que la liste a envoyés**, pas une
         copie reconstruite : c'est ce qui garantit qu'on agit sur ce qu'on
         voit. */
      ...(allMatching ? { selectAll: true, filters } : { ids }),
    });
    if (result) {
      const done = { action, ids, allMatching };
      setAction(null);
      setAllMatching(false);
      onDone(done);
    }
  };

  return (
    <div
      data-testid="bulk-bar"
      className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium" data-testid="bulk-count">
          {allMatching ? UI.SELECT_ALL_ACTIVE(total) : UI.SELECTED(ids.length)}
        </span>

        {/* Le second geste, celui qui dit la vérité sur l'étendue. */}
        {!allMatching && total > ids.length ? (
          <Button
            variant="outline"
            size="sm"
            data-testid="bulk-select-all"
            onClick={() => setAllMatching(true)}
          >
            {UI.SELECT_ALL_OFFER(total)}
          </Button>
        ) : null}

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={tooMany} data-testid="bulk-action">
                {UI.PICK_ACTION}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((a) => (
                <DropdownMenuItem
                  key={a}
                  data-testid={`bulk-action-${a}`}
                  /* Le rouge du libellé signale l'action destructive dans la
                     liste ; l'aplat plein reste au bouton de la fenêtre. */
                  className={a === 'DELETE' ? 'text-destructive' : undefined}
                  onSelect={() => setAction(a)}
                >
                  {BULK_ACTION_LABELS[a]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            mode="icon"
            aria-label={UI.CLEAR}
            data-testid="bulk-clear"
            onClick={() => {
              setAllMatching(false);
              onClear();
            }}
          >
            <X />
          </Button>
        </div>
      </div>

      {/* Dit avant le clic, jamais traduit après : un refus du serveur sur
          une sélection légitime ne s'explique pas tout seul. */}
      {tooMany ? (
        <p data-testid="bulk-too-many" className="mt-2 text-sm text-destructive">
          {UI.TOO_MANY(BULK_MAX_IDS)}
        </p>
      ) : null}

      <BulkActionWindow
        action={action}
        count={count}
        allMatching={allMatching}
        options={options}
        running={bulk.running}
        onOpenChange={(open) => !open && setAction(null)}
        onConfirm={apply}
      />
    </div>
  );
}
