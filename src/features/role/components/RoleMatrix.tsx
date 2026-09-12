import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ROLES_UI } from '../constants/roles.constants';
import type { PermissionModule } from '../hooks/useRoles';
import type { CellValue } from '../hooks/useRoleDraft';

const UI = ROLES_UI;

/**
 * Les trois états d'un droit, dans l'ordre où on les lit : rien, puis de plus
 * en plus large.
 *
 * `ALL` n'y figure pas : il est réservé aux rôles du back-office, et l'API le
 * refuse. Ne pas le proposer vaut mieux que le proposer et le faire refuser.
 */
const CHOICES: { value: CellValue; label: string; hint: string }[] = [
  { value: 'NONE', label: UI.SCOPE.NONE.LABEL, hint: UI.SCOPE.NONE.HINT },
  { value: 'OWN', label: UI.SCOPE.OWN.LABEL, hint: UI.SCOPE.OWN.HINT },
  { value: 'PROJECT', label: UI.SCOPE.PROJECT.LABEL, hint: UI.SCOPE.PROJECT.HINT },
];

/**
 * La matrice des droits d'un rôle, un accordéon par module.
 *
 * Repliée à l'ouverture : vingt-trois modules dépliés font plusieurs écrans de
 * haut, et on cherche un droit sans jamais voir la liste des modules. Le
 * décompte « 4 / 7 » dit ce que chaque module contient sans l'ouvrir.
 *
 * En lecture — rôle système, ou avant de cliquer « Modifier » — la portée
 * s'affiche en pastille. Un droit non accordé n'affiche rien : une ligne vide
 * se lit plus vite qu'une pastille « Aucun » répétée soixante fois.
 */
export function RoleMatrix({
  modules,
  valueOf,
  setCell,
  grantedCount,
  editing,
}: {
  modules: PermissionModule[];
  valueOf: (code: string) => CellValue;
  setCell: (code: string, value: CellValue) => void;
  grantedCount: (codes?: string[]) => number;
  editing: boolean;
}) {
  return (
    <Accordion type="multiple" className="w-full" data-testid="role-matrix">
      {modules.map((module) => {
        const codes = module.permissions.map((p) => p.code);
        return (
          <AccordionItem key={module.key} value={module.key}>
            <AccordionTrigger data-testid={`role-module-${module.key}`}>
              <span className="flex w-full items-center justify-between pe-3">
                {module.label}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {UI.DRAWER.MODULE_COUNT(grantedCount(codes), codes.length)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="divide-y divide-border">
                {module.permissions.map((permission) => {
                  const value = valueOf(permission.code);
                  return (
                    <li
                      key={permission.code}
                      className="flex flex-wrap items-center justify-between gap-3 py-2"
                    >
                      <span className="text-sm">{permission.label}</span>

                      {editing ? (
                        /* Trois boutons plutôt qu'une liste déroulante : les
                           trois choix se lisent d'un coup, et l'état courant
                           se voit sans ouvrir quoi que ce soit. */
                        <span className="flex items-center gap-1">
                          {CHOICES.map((choice) => (
                            <Tooltip key={choice.value}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={value === choice.value ? 'primary' : 'outline'}
                                  data-testid={`role-cell-${permission.code}-${choice.value}`}
                                  onClick={() => setCell(permission.code, choice.value)}
                                >
                                  {choice.label}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{choice.hint}</TooltipContent>
                            </Tooltip>
                          ))}
                        </span>
                      ) : value === 'NONE' ? null : (
                        <Badge variant="secondary" appearance="outline" size="sm">
                          {UI.SCOPE[value].LABEL}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
