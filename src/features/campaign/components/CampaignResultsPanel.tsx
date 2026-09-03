import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { SALES_STATUS_LABELS } from '@/features/organization/constants/organizationList.constants';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import {
  CAMPAIGN_RESULTS_UI,
  CAMPAIGNS_UI,
} from '../constants/campaign.constants';
import { useCampaignResults } from '../hooks/useCampaignResults';
import type { Campaign } from '../types/campaign';
import { CampaignPager } from './CampaignPager';

const UI = CAMPAIGN_RESULTS_UI;

type Props = {
  campaign: Campaign | null;
  onOpenChange: (open: boolean) => void;
};

/** Le slot `useHooks` n'a rien a porter : tout vient du composant. */
type Hooks = Record<string, never>;
const emptyHooks = (): Hooks => ({});

/**
 * Le detail des resultats d'une campagne — L1 · US-01-11, tranche C.
 *
 * La carte donne les quatre totaux ; ici on voit **qui** les produit. Au L1
 * seul le compteur d'actions est alimente, les trois autres restent a zero
 * sans changement de contrat a venir.
 */
export function CampaignResultsPanel({ campaign, onOpenChange }: Props) {
  /*
   * Appele ici, pas dans le slot `useHooks` : une fonction flechee y serait un
   * callback, ou les regles des hooks ne s'appliquent plus.
   */
  const results = useCampaignResults(campaign?.id ?? null, !!campaign);

  return (
    <ReusableSheet<Hooks>
      open={!!campaign}
      onOpenChange={onOpenChange}
      title={campaign ? `${UI.TITLE} · ${campaign.name}` : UI.TITLE}
      description={UI.SUBTITLE}
      useHooks={emptyHooks}
      renderBody={() => (
        <div className="space-y-4" data-testid="campaign-results">
          {results.loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Les totaux du serveur, jamais la somme des lignes : une fiche
                  supprimée sort des lignes sans sortir du total. */}
              <div
                data-testid="campaign-results-totals"
                className="rounded-lg border border-border bg-muted/40 p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {UI.TOTALS}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    [CAMPAIGNS_UI.RESULTS.ACTIVITIES, results.totals?.activities],
                    [CAMPAIGNS_UI.RESULTS.OPPORTUNITIES, results.totals?.opportunities],
                    [CAMPAIGNS_UI.RESULTS.QUOTES, results.totals?.quotes],
                    [CAMPAIGNS_UI.RESULTS.SIGNED, results.totals?.signed],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-xs text-muted-foreground">{label}</dt>
                      <dd className="font-mono text-lg font-semibold">
                        {value ?? 0}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">
                  {CAMPAIGNS_UI.RESULTS.PENDING_HINT}
                </p>
              </div>

              {results.rows.length === 0 ? (
                <div
                  data-testid="campaign-results-empty"
                  className="rounded-lg border border-dashed border-border px-4 py-8 text-center"
                >
                  <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {UI.EMPTY.DESCRIPTION}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-start">
                        <th className="py-2 pe-3 text-start text-xs font-medium text-muted-foreground">
                          {UI.COLUMNS.ORGANIZATION}
                        </th>
                        <th className="py-2 pe-3 text-start text-xs font-medium text-muted-foreground">
                          {UI.COLUMNS.SALES_STATUS}
                        </th>
                        <th className="py-2 pe-3 text-end text-xs font-medium text-muted-foreground">
                          {UI.COLUMNS.ACTIVITIES}
                        </th>
                        <th className="py-2 text-start text-xs font-medium text-muted-foreground">
                          {UI.COLUMNS.LAST_ACTIVITY}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((row) => (
                        <tr
                          key={row.organizationId}
                          data-testid={`campaign-results-row-${row.organizationId}`}
                          className="border-b border-border/60"
                        >
                          <td className="py-2 pe-3">
                            <span className="flex flex-wrap items-center gap-2">
                              {row.name}
                              {/* Une fiche hors périmètre reste listée, en
                                  projection restreinte. */}
                              {row.access === 'RESTRICTED' ? (
                                <Badge variant="secondary" appearance="outline">
                                  {UI.RESTRICTED}
                                </Badge>
                              ) : null}
                            </span>
                          </td>
                          <td className="py-2 pe-3 text-muted-foreground">
                            {SALES_STATUS_LABELS[row.salesStatus]}
                          </td>
                          <td className="py-2 pe-3 text-end font-mono tabular-nums">
                            {row.activities}
                          </td>
                          {/* Une fiche ciblée sans action reste listée, à zéro :
                              c'est justement celle qu'il reste à travailler. */}
                          {/* Trois cas distincts, et non deux : une date, une
                              fiche sans action (`null`), et une fiche hors
                              périmètre dont le champ est **absent**. Dire
                              « Aucune » dans ce dernier cas serait faux. */}
                          <td className="py-2 text-muted-foreground">
                            {row.lastActivityAt
                              ? formatShortDateFr(row.lastActivityAt)
                              : row.lastActivityAt === null
                                ? UI.NEVER
                                : UI.NOT_DISCLOSED}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <CampaignPager
                meta={results.meta}
                page={results.page}
                onPage={results.setPage}
                testId="campaign-results"
              />
            </>
          )}
        </div>
      )}
      renderFooter={() => (
        <Button
          type="button"
          variant="outline"
          data-testid="campaign-results-close"
          onClick={() => onOpenChange(false)}
        >
          {UI.CLOSE}
        </Button>
      )}
    />
  );
}
