import { useState } from 'react';
import { FILTER_DEBOUNCE_MS } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import { CAMPAIGN_TARGET_UI } from '../constants/campaign.constants';
import { useCampaignTarget } from '../hooks/useCampaignTarget';
import { CAMPAIGN_TARGET_MAX_IDS } from '../types/campaign';

const UI = CAMPAIGN_TARGET_UI.PICKER;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
};

const emptyHooks = (): Record<string, never> => ({});

type Hooks = {
  search: string;
  setSearch: (v: string) => void;
  selected: Set<string>;
  toggle: (id: string) => void;
  list: ReturnType<typeof useOrganizations>;
  target: ReturnType<typeof useCampaignTarget>;
};

/**
 * Choix des organismes à ajouter à la cible.
 *
 * Le contrat limite chaque appel à 500 identifiants, et l'ajout est
 * idempotent : re-cocher une fiche déjà ciblée n'est pas une erreur, elle
 * revient dans `alreadyIn`.
 */
function usePicker(campaignId: string, open: boolean): Hooks {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debounced = useDebouncedValue(search, FILTER_DEBOUNCE_MS);

  return {
    search,
    setSearch,
    selected,
    toggle: (id) =>
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else if (next.size < CAMPAIGN_TARGET_MAX_IDS) next.add(id);
        return next;
      }),
    list: useOrganizations({
      page: 1,
      limit: 20,
      search: debounced.trim() || undefined,
    }),
    target: useCampaignTarget(campaignId, open),
  };
}

export function CampaignTargetPicker({ open, onOpenChange, campaignId }: Props) {
  // Appele ici, pas dans le slot : une fonction flechee y serait un callback,
  // ou les regles des hooks ne s'appliquent plus.
  const hooks = usePicker(campaignId, open);

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={emptyHooks}
      preventClose
      renderBody={() => (
        <div className="space-y-4">
          <Input
            data-testid="campaign-picker-search"
            value={hooks.search}
            placeholder={UI.SEARCH}
            onChange={(e) => hooks.setSearch(e.target.value)}
          />

          {hooks.list.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ul className="space-y-1.5">
              {hooks.list.organizations.map((org) => (
                <li key={org.id}>
                  <label className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                    <Checkbox
                      checked={hooks.selected.has(org.id)}
                      onCheckedChange={() => hooks.toggle(org.id)}
                      data-testid={`campaign-picker-${org.id}`}
                    />
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm">{org.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {[org.city, org.department].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">{UI.LIMIT}</p>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            data-testid="campaign-picker-confirm"
            disabled={hooks.selected.size === 0 || hooks.target.busy}
            onClick={async () => {
              const report = await hooks.target.add([...hooks.selected]);
              if (report) onOpenChange(false);
            }}
          >
            {UI.CONFIRM}
            {hooks.selected.size > 0
              ? ` · ${UI.SELECTED(hooks.selected.size)}`
              : ''}
          </Button>
        </>
      )}
    />
  );
}
