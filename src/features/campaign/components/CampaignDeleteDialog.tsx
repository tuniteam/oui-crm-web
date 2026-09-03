import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReusableWindow } from '@/components/window/ReusableWindow';
import { useScopeMutations } from '@/features/settings/hooks/useScopeMutations';
import { useScopes } from '@/features/settings/hooks/useScopes';
import { CAMPAIGN_DELETE_UI } from '../constants/campaign.constants';
import { useCampaignMutations } from '../hooks/useCampaignMutations';
import type { BlockingScope, Campaign } from '../types/campaign';

const UI = CAMPAIGN_DELETE_UI;

type Props = {
  campaign: Campaign | null;
  onOpenChange: (open: boolean) => void;
};

const emptyHooks = (): Record<string, never> => ({});

/**
 * Supprimer une campagne — L1 · US-01-11, tranche C.
 *
 * Le serveur refuse tant qu'un périmètre cite la campagne, et **nomme** les
 * fautifs. On les affiche et on propose de détacher, un par un : un périmètre
 * est du contrôle d'accès, il ne se modifie pas dans le dos de son
 * administrateur. Aucun nettoyage automatique, donc.
 */
export function CampaignDeleteDialog({ campaign, onOpenChange }: Props) {
  const [blocking, setBlocking] = useState<BlockingScope[] | null>(null);
  const campaigns = useCampaignMutations();
  const scopeMutations = useScopeMutations();

  /*
   * La liste complète des périmètres n'est chargée qu'une fois le refus connu :
   * `meta.scopes` ne donne que `{ id, name }`, et le PATCH remplace la liste
   * en bloc — il faut donc les `campaignIds` actuels du périmètre.
   */
  const { scopes } = useScopes(!!blocking);

  // Rouvrir sur une autre campagne ne doit pas hériter du refus précédent.
  useEffect(() => {
    if (!campaign) setBlocking(null);
  }, [campaign]);

  const runDelete = async () => {
    if (!campaign) return;
    const outcome = await campaigns.remove(campaign.id);
    if (outcome.status === 'deleted') {
      setBlocking(null);
      onOpenChange(false);
      return;
    }
    if (outcome.status === 'in-use') setBlocking(outcome.scopes);
  };

  const detach = async (scopeId: string) => {
    if (!campaign) return;
    const scope = scopes.find((s) => s.id === scopeId);
    if (!scope) return;
    const result = await scopeMutations.update(scopeId, {
      campaignIds: scope.campaignIds.filter((id) => id !== campaign.id),
    });
    if (result.status !== 'saved') return;
    setBlocking((prev) => prev?.filter((s) => s.id !== scopeId) ?? null);
  };

  const busy = campaigns.deleting || scopeMutations.saving;

  return (
    <ReusableWindow<Record<string, never>>
      open={!!campaign}
      onOpenChange={onOpenChange}
      title={blocking ? UI.BLOCKED_TITLE : UI.TITLE}
      useHooks={emptyHooks}
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="campaign-delete">
          {!blocking ? (
            <p className="text-sm">
              {campaign ? UI.CONFIRM(campaign.name) : ''}
            </p>
          ) : blocking.length === 0 ? (
            /* Refus sans `meta.scopes` : on le dit plutôt que d'inventer. */
            <p
              data-testid="campaign-delete-blocked-unnamed"
              className="text-sm text-muted-foreground"
            >
              {UI.BLOCKED_UNNAMED}
            </p>
          ) : (
            <>
              <p className="flex items-start gap-2 text-sm">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                {UI.BLOCKED(blocking.length)}
              </p>
              <ul className="space-y-2">
                {blocking.map((scope) => (
                  <li
                    key={scope.id}
                    data-testid={`campaign-delete-scope-${scope.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="min-w-0 grow truncate text-sm">
                      {scope.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      data-testid={`campaign-delete-detach-${scope.id}`}
                      onClick={() => void detach(scope.id)}
                    >
                      {UI.DETACH}
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            data-testid="campaign-delete-cancel"
            onClick={() => onOpenChange(false)}
          >
            {blocking && blocking.length === 0
              ? UI.ACTIONS.CLOSE
              : UI.ACTIONS.CANCEL}
          </Button>
          {/* Rejouer la suppression reste offert tant qu'un périmètre est
              nommé : détacher le dernier la rend possible. */}
          {!blocking || blocking.length > 0 ? (
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              data-testid="campaign-delete-confirm"
              onClick={() => void runDelete()}
            >
              {UI.ACTIONS.DELETE}
            </Button>
          ) : null}
        </>
      )}
    />
  );
}
