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

/** Un module du catalogue, avec ses droits — ce que la matrice affiche. */
export type MatrixModule = {
  key: string;
  label: string;
  permissions: { code: string; label: string }[];
};

/** Un des états qu'une case peut prendre, avec ce qu'il veut dire. */
export type MatrixChoice<V extends string> = {
  value: V;
  label: string;
  hint: string;
};

/**
 * Une matrice de droits, un accordéon par module.
 *
 * Repliée à l'ouverture : vingt-trois modules dépliés font plusieurs écrans de
 * haut, et on cherche un droit sans jamais voir la liste des modules. Le
 * décompte en tête dit ce que chaque module contient sans l'ouvrir.
 *
 * **Les états sont un paramètre, pas une hypothèse.** Un rôle choisit une
 * portée — aucune, ses fiches, tout le projet ; une exception individuelle
 * choisit une provenance — héritée du rôle, accordée, retirée. Même
 * disposition, même lecture, deux vocabulaires : les écrire deux fois donnait
 * deux accordéons à maintenir et deux occasions de divergence.
 *
 * En lecture, `readLabelOf` décide de la pastille, et peut ne rien afficher —
 * une ligne vide se lit plus vite qu'une pastille « Aucun » répétée soixante
 * fois.
 */
export function PermissionMatrix<V extends string>({
  modules,
  choicesFor,
  valueOf,
  setCell,
  countOf,
  readLabelOf,
  editing,
  testId,
  cellTestId,
}: {
  modules: MatrixModule[];
  /**
   * Les états proposés **pour ce droit**.
   *
   * Ils dépendent de la ligne : sur une exception individuelle, un droit que
   * le rôle accorde se laisse retirer, un droit qu'il n'accorde pas se laisse
   * accorder — proposer « Accordé » sur le premier ne veut rien dire.
   */
  choicesFor: (code: string) => readonly MatrixChoice<V>[];
  valueOf: (code: string) => V;
  setCell: (code: string, value: V) => void;
  /** Le décompte affiché en tête d'un module replié, déjà mis en forme. */
  countOf: (codes: string[]) => string;
  /** La pastille en lecture, ou `null` pour ne rien afficher. */
  readLabelOf: (value: V) => string | null;
  editing: boolean;
  testId?: string;
  /** Préfixe des identifiants de test d'une case, pour la recette. */
  cellTestId?: string;
}) {
  return (
    <Accordion type="multiple" className="w-full" data-testid={testId}>
      {modules.map((module) => {
        const codes = module.permissions.map((p) => p.code);
        return (
          <AccordionItem key={module.key} value={module.key}>
            <AccordionTrigger data-testid={`${cellTestId ?? 'matrix'}-module-${module.key}`}>
              <span className="flex w-full items-center justify-between pe-3">
                {module.label}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {countOf(codes)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="divide-y divide-border">
                {module.permissions.map((permission) => {
                  const value = valueOf(permission.code);
                  const readLabel = readLabelOf(value);
                  return (
                    <li
                      key={permission.code}
                      className="flex flex-wrap items-center justify-between gap-3 py-2"
                    >
                      <span className="text-sm">{permission.label}</span>

                      {editing ? (
                        /* Des boutons plutôt qu'une liste déroulante : les
                           choix se lisent d'un coup, et l'état courant se voit
                           sans ouvrir quoi que ce soit. */
                        <span className="flex items-center gap-1">
                          {choicesFor(permission.code).map((choice) => (
                            <Tooltip key={choice.value}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={value === choice.value ? 'primary' : 'outline'}
                                  data-testid={`${cellTestId ?? 'matrix'}-cell-${permission.code}-${choice.value}`}
                                  onClick={() => setCell(permission.code, choice.value)}
                                >
                                  {choice.label}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{choice.hint}</TooltipContent>
                            </Tooltip>
                          ))}
                        </span>
                      ) : readLabel ? (
                        <Badge variant="secondary" appearance="outline" size="sm">
                          {readLabel}
                        </Badge>
                      ) : null}
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
