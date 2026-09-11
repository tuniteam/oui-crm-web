import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import { PRICING_UI } from '../constants/pricing.constants';
import { setupLabelIssue } from '../utils/grid-edit';
import type {
  PricingGridContent,
  SetupFeeNature,
} from '../types/pricingGrid';

const UI = PRICING_UI.DRAWER.SETUP_WINDOW;
const NATURES = PRICING_UI.DRAWER.NATURE;

/**
 * Ajouter un poste de frais — L2 · US-02-01, SPEC-19.
 *
 * Deux saisies, et aucune n'est cosmétique.
 *
 * **Le libellé** doit rester distinct des autres : un devis figé reventile ses
 * lignes stockées par libellé, et deux postes homonymes y seraient
 * indiscernables. Le contrôle se fait ici, pas au retour d'un
 * `setupFees: duplicate label`.
 *
 * **La nature** commande la ventilation `oneShot` du devis. Avant SPEC-19, le
 * poste de formation se reconnaissait à sa clé écrite en dur : la renommer
 * faisait tomber la ventilation « formation » à zéro sans un mot. C'est
 * désormais un choix explicite, et il n'a pas de valeur par défaut évidente —
 * d'où deux boutons radio plutôt qu'une liste, comme la civilité d'un contact.
 */
export function AddSetupFeeWindow({
  open,
  onOpenChange,
  content,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: PricingGridContent | null;
  onConfirm: (label: string, nature: SetupFeeNature) => void;
}) {
  const [label, setLabel] = useState('');
  const [nature, setNature] = useState<SetupFeeNature>('SETUP');

  useEffect(() => {
    if (open) {
      setLabel('');
      setNature('SETUP');
    }
  }, [open]);

  const issue = content ? setupLabelIssue(content, label) : 'EMPTY';

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="pricing-setup-window">
          <div className="space-y-1.5">
            <Label htmlFor="pricing-setup-label">{UI.LABEL}</Label>
            <Input
              id="pricing-setup-label"
              data-testid="pricing-setup-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            {issue === 'DUPLICATE' ? (
              <p
                data-testid="pricing-setup-issue"
                className="text-sm text-destructive"
              >
                {UI.DUPLICATE}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{UI.LABEL_HINT}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{UI.NATURE}</Label>
            <RadioGroup
              value={nature}
              onValueChange={(v) => setNature(v as SetupFeeNature)}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="SETUP" id="pricing-nature-setup" />
                <Label htmlFor="pricing-nature-setup" className="font-normal">
                  {NATURES.SETUP}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="TRAINING" id="pricing-nature-training" />
                <Label
                  htmlFor="pricing-nature-training"
                  className="font-normal"
                >
                  {NATURES.TRAINING}
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">{UI.NATURE_HINT}</p>
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="pricing-setup-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={issue !== null}
            data-testid="pricing-setup-confirm"
            onClick={() => onConfirm(label.trim(), nature)}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
