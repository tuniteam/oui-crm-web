import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import {
  BULK_ACTION_LABELS,
  BULK_FIELDS,
  BULK_WINDOW,
} from '../constants/bulk.constants';
import type { BulkAction, BulkPayload } from '../types/bulk';

const UI = BULK_WINDOW;
const emptyHooks = (): Record<string, never> => ({});

type Option = { value: string; label: string };

type Props = {
  /** L'action demandée, ou `null` quand la fenêtre est fermée. */
  action: BulkAction | null;
  /** Sur combien de fiches elle portera. */
  count: number;
  /** Vrai quand l'action vise tout ce qui correspond aux filtres. */
  allMatching: boolean;
  /** Les valeurs proposées, quand l'action en réclame une. */
  options: Option[];
  running: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: BulkPayload) => void | Promise<void>;
};

/**
 * La fenêtre d'une action groupée — L1 · US-01-05.
 *
 * **Une action, une fenêtre.** La barre ne porte plus qu'une commande ; c'est
 * ici qu'on choisit la valeur et qu'on confirme. Trois raisons, toutes tirées
 * de la cible du produit — des commerciaux, pas des utilisateurs avancés :
 *
 * - l'étendue est **rappelée au moment de valider**, là où elle compte, et non
 *   dans une barre qu'on a cessé de lire ;
 * - rien d'irréversible ne part au premier clic ;
 * - c'est le motif de fenêtre que le reste de l'application emploie déjà — un
 *   écran qui ressemble aux autres s'apprend une fois.
 */
export function BulkActionWindow({
  action,
  count,
  allMatching,
  options,
  running,
  onOpenChange,
  onConfirm,
}: Props) {
  const [value, setValue] = useState('');
  const field = action ? BULK_FIELDS[action] : null;
  const destructive = action === 'DELETE';

  // Rouvrir sur une autre action ne doit pas hériter du choix précédent.
  useEffect(() => setValue(''), [action]);

  return (
    <ReusableWindow<Record<string, never>>
      open={action !== null}
      onOpenChange={onOpenChange}
      title={action ? BULK_ACTION_LABELS[action] : ''}
      useHooks={emptyHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="bulk-window">
          {/* L'étendue, en toutes lettres et en chiffres : « 12 fiches », pas
              « la sélection ». */}
          <p className="text-sm">
            {allMatching ? UI.SCOPE_ALL(count) : UI.SCOPE(count)}
          </p>

          {field?.needsValue ? (
            <div className="space-y-1.5">
              <Label htmlFor="bulk-window-value">{field.label}</Label>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger id="bulk-window-value" data-testid="bulk-window-value">
                  <SelectValue placeholder={UI.PICK_VALUE}>
                    {options.find((o) => o.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {destructive ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm">
                {allMatching ? UI.DELETE_WARNING_ALL : UI.DELETE_WARNING}
              </p>
            </div>
          ) : null}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="bulk-window-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          {/* L'aplat rouge plein n'existe qu'ici : c'est le seul endroit où la
              suppression s'exécute. Voir `docs/REGLE-BADGE-VS-BOUTON.md`. */}
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'primary'}
            disabled={running || (field?.needsValue === true && !value)}
            data-testid="bulk-window-confirm"
            onClick={() =>
              void onConfirm(
                field?.needsValue ? field.toPayload(value) : {},
              )
            }
          >
            {destructive ? BULK_ACTION_LABELS.DELETE : UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
