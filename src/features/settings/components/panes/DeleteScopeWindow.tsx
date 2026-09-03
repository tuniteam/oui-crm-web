import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { DELETE_SCOPE_WINDOW } from '../../constants/scopes.constants';
import { useScopeMutations } from '../../hooks/useScopeMutations';
import type { Scope } from '../../types/scopes';

const UI = DELETE_SCOPE_WINDOW;

type Props = {
  scope: Scope;
  onOpenChange: (open: boolean) => void;
};

type Hooks = ReturnType<typeof useScopeMutations>;

/**
 * Suppression d'un périmètre — US-00-07.
 *
 * L'écran ne promet pas que la suppression aboutira, et c'est délibéré : le
 * serveur la refuse dès qu'un utilisateur porte le périmètre, **compte
 * suspendu compris**, alors que le `usersCount` affiché ne compte que les
 * affectations actives. Un périmètre à « 0 utilisateur » peut donc être
 * refusé. On propose, et on traduit le refus.
 */
export function DeleteScopeWindow({ scope, onOpenChange }: Props) {
  const [blocked, setBlocked] = useState(false);

  return (
    <ReusableWindow<Hooks>
      open
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      description={scope.name}
      useHooks={useScopeMutations}
      preventClose
      renderBody={() =>
        blocked ? (
          <div
            data-testid="scope-delete-blocked"
            className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold">
              <TriangleAlert className="size-4" />
              {UI.BLOCKED.TITLE}
            </p>
            <p className="text-sm text-muted-foreground">
              {UI.BLOCKED.DESCRIPTION}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">{UI.INTRO}</p>
            <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
              {UI.BULLETS.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )
      }
      renderFooter={(hooks) => (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {UI.ACTIONS.CANCEL}
          </Button>
          {blocked ? null : (
            <Button
              type="button"
              variant="destructive"
              data-testid="scope-delete-confirm"
              disabled={hooks.deleting}
              onClick={async () => {
                const outcome = await hooks.remove(scope.id);
                if (outcome === 'deleted') onOpenChange(false);
                if (outcome === 'in-use') setBlocked(true);
              }}
            >
              {UI.ACTIONS.CONFIRM}
            </Button>
          )}
        </>
      )}
    />
  );
}
