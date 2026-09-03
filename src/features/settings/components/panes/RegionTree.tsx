import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { SCOPE_WINDOW } from '../../constants/scopes.constants';
import type { GeoRegion } from '../../types/scopes';

const UI = SCOPE_WINDOW;

type Props = {
  regions: GeoRegion[];
  /** Codes de département cochés. Vide = tout le territoire. */
  value: string[];
  onChange: (departments: string[]) => void;
  disabled?: boolean;
};

/**
 * Régions et départements — US-00-07.
 *
 * Cocher une région coche ses départements, chacun restant décochable. C'est
 * le geste central de l'écran, et il porte une conséquence du contrat : une
 * région amputée d'un seul département ne peut plus s'exprimer par son nom, et
 * partira en départements explicites à l'enregistrement.
 *
 * Les régions viennent de `GET /geo/regions` — jamais d'une liste en dur, à la
 * différence de la maquette, qui n'a pas de serveur.
 */
export function RegionTree({ regions, value, onChange, disabled }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const checked = useMemo(() => new Set(value), [value]);

  const setChecked = (next: Set<string>) => onChange([...next].sort());

  const toggleRegion = (region: GeoRegion, on: boolean) => {
    const next = new Set(checked);
    for (const dept of region.departments) {
      if (on) next.add(dept);
      else next.delete(dept);
    }
    setChecked(next);
  };

  const toggleDepartment = (dept: string, on: boolean) => {
    const next = new Set(checked);
    if (on) next.add(dept);
    else next.delete(dept);
    setChecked(next);
  };

  const allDepartments = useMemo(
    () => regions.flatMap((r) => r.departments),
    [regions],
  );

  return (
    <div className="space-y-3" data-testid="region-tree">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{UI.DESCRIPTION}</p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setChecked(new Set(allDepartments))}
          >
            {UI.ACTIONS.SELECT_ALL}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            data-testid="region-tree-clear"
            onClick={() => setChecked(new Set())}
          >
            {UI.ACTIONS.CLEAR}
          </Button>
        </div>
      </div>

      <ul className="space-y-1.5">
        {regions.map((region) => {
          const count = region.departments.filter((d) => checked.has(d)).length;
          const whole = count === region.departments.length && count > 0;
          const isOpen = expanded.has(region.name);

          return (
            <li
              key={region.name}
              className="rounded-lg border border-border"
              data-testid={`region-${region.name}`}
            >
              <div className="flex items-center gap-2 p-2.5">
                <Checkbox
                  /* Radix porte l'etat indetermine dans `checked`, pas dans une
                     prop dediee. Partiellement cochee, la region partira en
                     departements explicites et non sous son nom : la case le
                     dit. */
                  checked={whole ? true : count > 0 ? 'indeterminate' : false}
                  disabled={disabled}
                  data-testid={`region-check-${region.name}`}
                  onCheckedChange={(on) => toggleRegion(region, on === true)}
                />

                <button
                  type="button"
                  className="flex grow items-center gap-1.5 text-left text-sm"
                  onClick={() =>
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(region.name)) next.delete(region.name);
                      else next.add(region.name);
                      return next;
                    })
                  }
                >
                  {isOpen ? (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium">{region.name}</span>
                  <span
                    className={cn(
                      'text-xs',
                      count > 0 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {count}/{region.departments.length}
                  </span>
                </button>
              </div>

              {isOpen ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border p-2.5 ps-9">
                  {region.departments.map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center gap-1.5 font-mono text-xs"
                    >
                      <Checkbox
                        checked={checked.has(dept)}
                        disabled={disabled}
                        data-testid={`dept-check-${dept}`}
                        onCheckedChange={(on) =>
                          toggleDepartment(dept, on === true)
                        }
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted-foreground" data-testid="region-tree-count">
        {UI.COUNT(checked.size)}
      </p>
    </div>
  );
}
