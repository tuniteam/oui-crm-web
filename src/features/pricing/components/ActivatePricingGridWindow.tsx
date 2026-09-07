import { useEffect, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PRICING_UI } from '../constants/pricing.constants';
import { InlineCalendar } from './InlineCalendar';
import type { PricingGridSummary } from '../types/pricingGrid';

const UI = PRICING_UI.ACTIVATE_WINDOW;

/**
 * Activer une version — L2 · US-02-01, tranche C.
 *
 * La fenêtre dit **ce qui change**, pas « êtes-vous sûr ? » : les nouveaux
 * devis suivront cette version, ceux déjà émis gardent leur chiffrage. C'est
 * la seule information dont l'administrateur a besoin pour décider.
 *
 * La date d'effet se confirme ici, et non à la préparation : c'est le moment
 * où l'on sait quand la grille s'applique vraiment. Laissée vide, le serveur
 * prend le jour de l'activation — le champ reste donc facultatif.
 */
export function ActivatePricingGridWindow({
  open,
  onOpenChange,
  grid,
  /** Devis déjà émis, toutes versions confondues : ils gardent leur chiffrage. */
  issuedQuotes,
  busy,
  /**
   * La filiation est périmée — connue dès la liste, ou apprise du refus du
   * serveur si un autre administrateur a activé entre-temps.
   */
  outdated,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grid: PricingGridSummary | null;
  issuedQuotes: number;
  busy: boolean;
  outdated: { activeVersion: number | null; basedOnVersion: number | null } | null;
  onConfirm: (payload: { effectiveDate?: string; force?: boolean }) => void;
}) {
  const [date, setDate] = useState('');

  // Rouvrir ne doit pas hériter d'une date abandonnée.
  useEffect(() => {
    if (open) setDate('');
  }, [open]);

  if (!grid) return null;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="pricing-activate-window">
          <p className="text-sm">{UI.LEAD(grid.version, issuedQuotes)}</p>

          {/*
            * Le refus du serveur, transformé en question.
            *
            * `409 PRICING_GRID_BASE_OUTDATED` n'est pas une panne : la version
            * a été préparée sur une grille qui n'est plus active, et l'activer
            * écraserait ce qui a été fait entre-temps. Revenir volontairement
            * à une grille antérieure reste légitime — d'où `force`, et d'où le
            * fait de poser la question plutôt que de barrer la route.
            *
            * L'avertissement est affiché **avant** le clic, et le bouton dit
            * alors « Activer quand même » : le `force` part au premier clic,
            * mais jamais sans que le risque ait été lu. Demander deux clics
            * sur un écran inchangé n'aurait rien appris de plus.
            */}
          {outdated ? (
            <p
              data-testid="pricing-activate-outdated"
              className="flex items-start gap-2 rounded-lg border border-warning bg-warning-soft px-3 py-2 text-sm"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                {UI.OUTDATED(
                  grid.version,
                  outdated.basedOnVersion ?? grid.basedOnVersion ?? 0,
                  outdated.activeVersion ?? 0,
                )}
              </span>
            </p>
          ) : null}

          <div className="space-y-1.5">
            <Label>{UI.DATE}</Label>
            <InlineCalendar
              value={date}
              onChange={setDate}
              testId="pricing-activate-date"
            />
            <p className="text-xs text-muted-foreground">{UI.DATE_HINT}</p>
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            data-testid="pricing-activate-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={busy}
            data-testid="pricing-activate-confirm"
            onClick={() =>
              onConfirm({
                effectiveDate: date || undefined,
                force: outdated ? true : undefined,
              })
            }
          >
            {outdated ? UI.CONFIRM_FORCE : UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
