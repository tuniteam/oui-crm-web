import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReusableSheet } from '@/components/drawer/ReusableSheet';
import { noWindowHooks } from '@/components/window/ReusableWindow';
import { formatShortDateFr } from '@/shared/utils/date-utils';
import { PRICING_UI } from '../constants/pricing.constants';
import { usePricingGrids } from '../hooks/usePricingGrids';
import type { PricingGridSummary } from '../types/pricingGrid';
import { PricingGridBody } from './PricingGridDrawer';

const UI = PRICING_UI;
const EMPTY_VALUE = '—';

/** L'état d'une version, en un mot. */
function StateBadge({ grid }: { grid: PricingGridSummary }) {
  if (grid.active) {
    return (
      <Badge variant="success" appearance="outline" size="sm">
        {UI.STATE.ACTIVE}
      </Badge>
    );
  }
  /* « Remplacée » et « en préparation » se distinguent par les devis : une
     version qui en porte a chiffré, donc elle a été active. */
  const replaced = grid.quotesCount > 0;
  return (
    <Badge variant="secondary" appearance="outline" size="sm">
      {replaced ? UI.STATE.REPLACED : UI.STATE.PREPARED}
    </Badge>
  );
}

/**
 * Paramètres › Grille tarifaire — L2 · US-02-01, tranche A (lecture).
 *
 * **L'écran montre les versions, pas les prix.** Une grille n'est pas un
 * réglage mais un document daté : une seule chiffre les devis, et les devis
 * déjà émis restent attachés à la leur. Un écran unique et modifiable, comme
 * dans la V8, ferait croire qu'un prix corrigé s'applique aussitôt.
 *
 * Choisir une ligne ouvre son contenu dans un tiroir — la liste ne porte pas
 * `content`, il se charge à la demande.
 */
export function PricingGridsPane() {
  const { grids, loading } = usePricingGrids({ page: 1, limit: 20 });
  const [openedId, setOpenedId] = useState<string | null>(null);
  const opened = grids.find((g) => g.id === openedId) ?? null;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pricing-grids-pane">
      {/* Le modèle mental, dit avant le tableau. */}
      <p className="text-sm text-muted-foreground">{UI.LEAD}</p>

      {grids.length === 0 ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-sm font-semibold">{UI.EMPTY.TITLE}</p>
          <p className="text-sm text-muted-foreground">{UI.EMPTY.BODY}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.COLUMNS.VERSION}</TableHead>
                <TableHead>{UI.COLUMNS.EFFECTIVE_DATE}</TableHead>
                <TableHead>{UI.COLUMNS.STATE}</TableHead>
                <TableHead className="text-end">{UI.COLUMNS.QUOTES}</TableHead>
                <TableHead>{UI.COLUMNS.CREATED_BY}</TableHead>
                <TableHead>{UI.COLUMNS.CREATED_AT}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grids.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid={`pricing-open-${g.version}`}
                      onClick={() => setOpenedId(g.id)}
                      className="h-auto px-0 font-semibold"
                    >
                      {UI.VERSION(g.version)}
                    </Button>
                    {/* La filiation, quand elle existe : c'est le signal qui
                        manque à qui active une version préparée sur une grille
                        entre-temps remplacée. */}
                    {g.basedOnVersion !== null ? (
                      <span className="block text-xs text-muted-foreground">
                        {UI.DERIVED_FROM(g.basedOnVersion)}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatShortDateFr(g.effectiveDate) || EMPTY_VALUE}
                  </TableCell>
                  <TableCell>
                    <StateBadge grid={g} />
                  </TableCell>
                  <TableCell className="text-end tabular-nums">
                    {g.quotesCount}
                  </TableCell>
                  {/* `createdBy` vaut `null` pour la version du seed : un
                      tiret, jamais « null ». */}
                  <TableCell>{g.createdBy?.fullName ?? EMPTY_VALUE}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatShortDateFr(g.createdAt) || EMPTY_VALUE}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ReusableSheet<Record<string, never>>
        open={openedId !== null}
        onOpenChange={(open) => !open && setOpenedId(null)}
        title={opened ? UI.VERSION(opened.version) : ''}
        description={
          opened
            ? [
                opened.active ? UI.STATE.ACTIVE : UI.STATE.PREPARED,
                formatShortDateFr(opened.effectiveDate),
                opened.basedOnVersion !== null
                  ? UI.DERIVED_FROM(opened.basedOnVersion)
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')
            : ''
        }
        useHooks={noWindowHooks}
        /* Large : les frais de mise en place font huit colonnes, et le tiroir
           de fiche est taillé pour deux colonnes de champs. */
        className="sm:max-w-4xl"
        renderBody={() => <PricingGridBody gridId={openedId} />}
      />
    </div>
  );
}
