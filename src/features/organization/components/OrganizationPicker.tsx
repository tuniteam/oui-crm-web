import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FILTER_DEBOUNCE_MS } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ORGANIZATION_PICKER } from '../constants/organizationList.constants';
import { useOrganization } from '../hooks/useOrganization';
import { useOrganizations } from '../hooks/useOrganizations';

const UI = ORGANIZATION_PICKER;

/** Le serveur plafonne à 100 par page ; on en montre vingt et on affine. */
const PAGE_SIZE = 20;

type Props = {
  value: string;
  onChange: (organizationId: string) => void;
  disabled?: boolean;
  'data-testid'?: string;
};

/**
 * Désigner un organisme — recherche serveur, pas liste complète.
 *
 * Un simple `Select` demandait cent fiches, **le maximum absolu du contrat** :
 * au-delà, les suivantes n'arrivaient jamais et rien ne le disait. Sur une
 * base de cinq cents organismes, chercher le quatre-centième était impossible
 * sans que l'écran l'explique.
 *
 * On interroge donc `GET /organizations?search=`, comme la liste des
 * organismes, et on annonce ce qui reste au-delà des résultats montrés : dans
 * un combobox on affine, on ne feuillette pas.
 */
export function OrganizationPicker({
  value,
  onChange,
  disabled = false,
  'data-testid': testId = 'organization-picker',
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search, FILTER_DEBOUNCE_MS);

  const { organizations, meta } = useOrganizations({
    page: 1,
    limit: PAGE_SIZE,
    search: debounced.trim() || undefined,
  });

  /*
   * Le libelle du choix courant se lit sur la fiche elle-meme, pas sur la
   * page de resultats : sans cela, taper autre chose viderait le champ a
   * l'ecran alors que la valeur tient toujours. La requete ne part que si
   * l'organisme n'est pas deja dans les resultats.
   */
  const inPage = organizations.find((o) => o.id === value) ?? null;
  const { organization } = useOrganization(value || undefined, !!value && !inPage);
  const selected = inPage ?? organization ?? null;

  const total = meta?.total ?? organizations.length;
  const hidden = total - organizations.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          data-testid={testId}
          className={cn(
            'w-full justify-between font-normal',
            !selected && 'text-muted-foreground',
          )}
        >
          {selected ? selected.name : UI.PLACEHOLDER}
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        {/* `shouldFilter={false}` : c'est le serveur qui cherche, pas la liste
            déjà rendue — sinon on ne filtrerait que les vingt reçues. */}
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder={UI.SEARCH}
            data-testid={`${testId}-search`}
          />
          <CommandList>
            <CommandEmpty>{UI.EMPTY}</CommandEmpty>
            {organizations.map((o) => (
              /* Une fiche hors périmètre se voit en projection restreinte mais
                 n'accepte pas d'action : le serveur rendrait `403`. Elle reste
                 visible, inerte. */
              <CommandItem
                key={o.id}
                value={o.id}
                disabled={o.access === 'RESTRICTED'}
                data-testid={`${testId}-option-${o.id}`}
                onSelect={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'size-4',
                    o.id === value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="min-w-0 grow truncate">
                  {o.access === 'RESTRICTED' ? UI.RESTRICTED(o.name) : o.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {[o.city, o.department].filter(Boolean).join(' · ')}
                </span>
              </CommandItem>
            ))}
          </CommandList>

          {/* Sans ce compte, une liste tronquée se lit comme une base vide de
              ce qu'on cherche. */}
          {hidden > 0 ? (
            <p
              data-testid={`${testId}-more`}
              className="border-t border-border px-3 py-2 text-xs text-muted-foreground"
            >
              {UI.MORE(organizations.length, total)}
            </p>
          ) : null}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
