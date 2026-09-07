import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PRICING_UI } from '../constants/pricing.constants';
import { planNameIssue } from '../utils/grid-edit';
import type { PricingGridContent } from '../types/pricingGrid';

const UI = PRICING_UI.DRAWER.PLAN_WINDOW;

/**
 * Ajouter une formule — L2 · US-02-01, SPEC-19.
 *
 * Le nom se contrôle **avant** l'envoi : les trois refus du serveur —
 * vide, doublon, nom réservé — arrivent sinon en anglais, à l'enregistrement
 * de toute la grille, longtemps après la saisie.
 *
 * « label » et « nature » sont réservés parce que ce sont les attributs d'un
 * poste de frais, et que les prix par formule vivent dans le même objet
 * qu'eux : une formule ainsi nommée les écraserait.
 */
export function AddPlanWindow({
  open,
  onOpenChange,
  content,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: PricingGridContent | null;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  const issue = content ? planNameIssue(content, name) : 'EMPTY';
  const message =
    name.trim() === ''
      ? null
      : issue === 'RESERVED'
        ? UI.RESERVED
        : issue === 'DUPLICATE'
          ? UI.DUPLICATE
          : null;

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-1.5" data-testid="pricing-plan-window">
          <Label htmlFor="pricing-plan-name">{UI.NAME}</Label>
          <Input
            id="pricing-plan-name"
            data-testid="pricing-plan-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {message ? (
            <p
              data-testid="pricing-plan-issue"
              className="text-sm text-destructive"
            >
              {message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">{UI.NAME_HINT}</p>
          )}
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="pricing-plan-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={issue !== null}
            data-testid="pricing-plan-confirm"
            onClick={() => onConfirm(name.trim())}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
