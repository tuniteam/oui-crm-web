import { Button } from '@/components/ui/button';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PRICING_UI } from '../constants/pricing.constants';
import type { PricingGridSummary } from '../types/pricingGrid';

const UI = PRICING_UI.DELETE_WINDOW;

/**
 * Renoncer à une version — L2 · US-02-01, tranche C.
 *
 * La fenêtre ne redit pas ce qui bloque : le bouton est déjà grisé sur les
 * versions qui refuseraient — l'active, et celles qui portent un devis. Ne
 * reste ici que ce que la suppression fait vraiment, dont le fait que le
 * numéro ne revient pas : la suite aura des trous, et c'est normal.
 */
export function DeletePricingGridWindow({
  open,
  onOpenChange,
  grid,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grid: PricingGridSummary | null;
  busy: boolean;
  onConfirm: () => void;
}) {
  if (!grid) return null;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-3" data-testid="pricing-delete-window">
          <p className="text-sm">{UI.LEAD(grid.version)}</p>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            data-testid="pricing-delete-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={busy}
            data-testid="pricing-delete-confirm"
            onClick={onConfirm}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
