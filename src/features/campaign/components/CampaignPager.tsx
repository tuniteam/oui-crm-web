import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CAMPAIGN_PAGER } from '../constants/campaign.constants';
import type { PaginationMeta } from '../types/campaign';

const UI = CAMPAIGN_PAGER;

type Props = {
  meta: PaginationMeta | null;
  page: number;
  onPage: (page: number) => void;
  /** Suffixe des `data-testid`, pour distinguer la cible des résultats. */
  testId: string;
};

/**
 * Pagination de la cible et des résultats — L1 · US-01-11.
 *
 * Les deux routes sont paginées à vingt lignes, et une cible alimentée par un
 * import de territoire en compte des centaines : sans ces boutons, les fiches
 * au-delà de la première page sont inatteignables.
 *
 * Rien ne s'affiche quand il n'y a qu'une page — un pageur sur une liste qui
 * tient à l'écran fait douter qu'on voit bien tout.
 */
export function CampaignPager({ meta, page, onPage, testId }: Props) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div
      data-testid={`${testId}-pager`}
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"
    >
      <p className="text-xs text-muted-foreground">
        {UI.POSITION(page, meta.totalPages, meta.total)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          data-testid={`${testId}-prev`}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft className="size-4" />
          {UI.PREVIOUS}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= meta.totalPages}
          data-testid={`${testId}-next`}
          onClick={() => onPage(page + 1)}
        >
          {UI.NEXT}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
