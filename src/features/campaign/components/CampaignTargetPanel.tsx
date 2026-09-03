import { useState } from 'react';
import { CirclePlus, Info } from 'lucide-react';
import { PERMISSIONS } from '@/constants';
import { useMeStore } from '@/contexts/useMeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { CAMPAIGN_TARGET_UI } from '../constants/campaign.constants';
import { useCampaignTarget } from '../hooks/useCampaignTarget';
import type { Campaign } from '../types/campaign';
import { CampaignTargetPicker } from './CampaignTargetPicker';

const UI = CAMPAIGN_TARGET_UI;

type Props = {
  campaign: Campaign | null;
  onOpenChange: (open: boolean) => void;
};

/** Le slot `useHooks` n'a rien a porter : tout vient du composant. */
type Hooks = Record<string, never>;
const emptyHooks = (): Hooks => ({});

/**
 * La cible d'une campagne — L1 · US-01-11, tranche B.
 *
 * Elle est **figée** : elle ne se recalcule pas depuis les critères, on l'y
 * met et on l'en retire. Le panneau le dit, sans quoi un utilisateur croirait
 * que modifier les critères la met à jour.
 */
export function CampaignTargetPanel({ campaign, onOpenChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const canUpdate = useMeStore((s) =>
    s.hasPermission(PERMISSIONS.CAMPAIGNS.UPDATE),
  );

  /*
   * Le hook est appele ici, pas dans le slot `useHooks` : une fonction flechee
   * y serait un callback, ou les regles des hooks ne s'appliquent plus. La
   * requete ne part de toute facon que si le panneau est ouvert.
   */
  const target = useCampaignTarget(campaign?.id ?? null, !!campaign);

  return (
    <>
      <ReusableSheet<Hooks>
        open={!!campaign}
        onOpenChange={onOpenChange}
        title={campaign ? `${UI.TITLE} · ${campaign.name}` : UI.TITLE}
        description={UI.SUBTITLE}
        useHooks={emptyHooks}
        renderBody={() => (
          <div className="space-y-4" data-testid="campaign-target">
            {canUpdate ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {UI.SIDE_EFFECT}
                </p>
                <Button
                  data-testid="campaign-target-add"
                  onClick={() => setPickerOpen(true)}
                  disabled={target.busy}
                >
                  <CirclePlus className="size-4" />
                  {UI.ADD}
                </Button>
              </div>
            ) : null}

            {target.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : target.organizations.length === 0 ? (
              <div
                data-testid="campaign-target-empty"
                className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
              >
                <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {UI.EMPTY.DESCRIPTION}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {target.organizations.map((org) => (
                  <li
                    key={org.id}
                    data-testid={`campaign-target-row-${org.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 grow">
                      <p className="truncate text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[org.city, org.department].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {/* Une fiche hors périmètre reste listée, en projection
                        restreinte : on ne la retire pas de l'affichage. */}
                    {org.access === 'RESTRICTED' ? (
                      <Badge variant="secondary" appearance="outline">
                        {UI.RESTRICTED}
                      </Badge>
                    ) : null}

                    {canUpdate ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={target.busy}
                        data-testid={`campaign-target-remove-${org.id}`}
                        onClick={() => void target.remove(org.id)}
                      >
                        {UI.REMOVE}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        renderFooter={() => (
          <Button
            type="button"
            variant="outline"
            data-testid="campaign-target-close"
            onClick={() => onOpenChange(false)}
          >
            {UI.CLOSE}
          </Button>
        )}
      />

      {campaign ? (
        <CampaignTargetPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          campaignId={campaign.id}
        />
      ) : null}
    </>
  );
}
