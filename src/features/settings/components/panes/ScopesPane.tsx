import { Globe2, Users, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  SCOPE_NATURE_LABELS,
  SCOPES_UI,
} from '../../constants/scopes.constants';
import { useScopes } from '../../hooks/useScopes';
import type { Scope } from '../../types/scopes';

const UI = SCOPES_UI;
const { CARD } = UI;

/**
 * Périmètres — US-00-07, tranche A (lecture).
 *
 * Un périmètre décide de ce qu'un utilisateur voit dans la base d'organismes.
 * L'écran des organismes affiche déjà « hors de votre périmètre » sur des
 * lignes restreintes ; ce panneau est le premier endroit où l'on peut savoir
 * de quoi il s'agit.
 */
export function ScopesPane() {
  const { scopes, loading } = useScopes();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="scopes-pane">
      <div>
        <h2 className="text-lg font-semibold">{UI.TITLE}</h2>
        <p className="mt-1 max-w-[75ch] text-sm text-muted-foreground">
          {UI.DESCRIPTION}
        </p>
      </div>

      {scopes.length === 0 ? (
        <div
          data-testid="scopes-empty"
          className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
        >
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="mx-auto mt-1 max-w-[60ch] text-sm text-muted-foreground">
            {UI.EMPTY.DESCRIPTION}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {scopes.map((scope) => (
            <ScopeCard key={scope.id} scope={scope} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Une carte par périmètre : ce qu'il couvre, et pour combien de monde. */
function ScopeCard({ scope }: { scope: Scope }) {
  /*
   * Liste vide = tout le territoire, jamais « aucun département ».
   * La valeur est calculée par le serveur (`resolvedDepartments`) et ne se
   * recalcule pas ici : les régions y sont déjà dépliées et dédoublonnées.
   */
  const territory =
    scope.resolvedDepartments.length === 0
      ? CARD.WHOLE_TERRITORY
      : CARD.DEPARTMENTS(scope.resolvedDepartments.length);

  return (
    <li
      data-testid={`scope-card-${scope.id}`}
      className="rounded-lg border border-border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{scope.name}</p>
          {scope.description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {scope.description}
            </p>
          ) : null}
        </div>

        <Badge variant="secondary" appearance="outline">
          <Users className="size-3" />
          {CARD.USERS(scope.usersCount)}
        </Badge>
      </div>

      {/* Les trois axes, dans l'ordre où ils se lisent : où, quoi, à qui. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" appearance="outline">
          <Globe2 className="size-3" />
          {territory}
        </Badge>

        <Badge variant="secondary" appearance="outline">
          {SCOPE_NATURE_LABELS[scope.nature]}
        </Badge>

        {scope.portfolioOnly ? (
          <Badge variant="primary" appearance="outline">
            <Wallet className="size-3" />
            {CARD.PORTFOLIO_ONLY}
          </Badge>
        ) : null}

        {scope.campaignIds.length > 0 ? (
          <Badge variant="secondary" appearance="outline">
            {CARD.CAMPAIGNS(scope.campaignIds.length)}
          </Badge>
        ) : null}
      </div>

      {scope.resolvedDepartments.length > 0 ? (
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {scope.resolvedDepartments.join(' · ')}
        </p>
      ) : null}
    </li>
  );
}
