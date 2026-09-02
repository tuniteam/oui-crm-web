import { useState } from 'react';
import { Building2, Search, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREATE_ORGANIZATION_UI } from '../constants/organizationCreate.constants';
import type { CreateOrganizationHooks } from '../hooks/useCreateOrganizationForm';

const { REGISTRY } = CREATE_ORGANIZATION_UI;

/** Encart d'information, du plus neutre au plus alarmant. */
function Notice({
  tone = 'neutral',
  testId,
  children,
}: {
  tone?: 'neutral' | 'warn';
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      data-testid={testId}
      className={
        tone === 'warn'
          ? 'rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm'
          : 'rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground'
      }
    >
      {children}
    </p>
  );
}

/**
 * Recherche au registre officiel.
 *
 * Un resultat ne cree rien : il pre-remplit la saisie, que l'utilisateur
 * relit. Le type de structure est obligatoire et le registre ne le donne pas,
 * donc une creation en un clic serait de toute facon incomplete.
 */
export function RegistrySearchPane({ hooks }: { hooks: CreateOrganizationHooks }) {
  const { registry, applyMatch } = hooks;
  const [q, setQ] = useState('');

  const tooShort = q.trim().length < REGISTRY.MIN_LENGTH;

  const run = () => {
    if (tooShort) return;
    void registry.search(q.trim());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="registry-q">{REGISTRY.LABEL}</Label>
          <Input
            id="registry-q"
            data-testid="registry-search-input"
            value={q}
            placeholder={REGISTRY.PLACEHOLDER}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                run();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">{REGISTRY.HINT}</p>
        </div>
        <Button
          type="button"
          data-testid="registry-search-btn"
          onClick={run}
          disabled={tooShort || registry.loading}
        >
          <Search className="size-4" />
          {REGISTRY.SEARCH}
        </Button>
      </div>

      {q.length > 0 && tooShort && <Notice>{REGISTRY.TOO_SHORT}</Notice>}
      {registry.loading && <Notice>{REGISTRY.SEARCHING}</Notice>}

      {/* Panne du registre : cas nominal du contrat, pas un echec. */}
      {registry.degraded && (
        <Notice tone="warn" testId="registry-degraded">
          {REGISTRY.UNAVAILABLE}
        </Notice>
      )}

      {registry.matches?.length === 0 && (
        <Notice testId="registry-empty">{REGISTRY.NO_RESULT}</Notice>
      )}

      <ul className="space-y-2" data-testid="registry-results">
        {registry.matches?.map((match) => (
          <li
            key={match.siret}
            className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{match.name}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {[match.address, match.postalCode, match.city]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {REGISTRY.IDENTIFIERS(match.siret, match.inseeCode)}
              </p>
              {/* Une unite legale fermee reste creable : on avertit seulement. */}
              {!match.isActive && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600">
                  <TriangleAlert className="size-3.5" />
                  {REGISTRY.INACTIVE}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid={`registry-use-${match.siret}`}
              onClick={() => applyMatch(match)}
            >
              {REGISTRY.USE}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
