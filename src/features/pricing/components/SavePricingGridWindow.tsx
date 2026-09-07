import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  noWindowHooks,
  ReusableWindow,
} from '@/components/window/ReusableWindow';
import {
  formatDateStringToDate,
  formatDateToValue,
} from '@/shared/utils/date-utils';
import { PRICING_UI } from '../constants/pricing.constants';

const UI = PRICING_UI.SAVE_WINDOW;

/** Aujourd'hui en `YYYY-MM-DD`, sans construire d'instant. */
const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * La date d'effet, demandée avant d'enregistrer — L2 · US-02-01, tranche B.
 *
 * C'est le seul geste qui appelle le serveur de tout le parcours d'édition, et
 * il crée une version : la fenêtre le dit en toutes lettres plutôt que de
 * laisser croire à un enregistrement ordinaire.
 *
 * **La date est déclarative.** Aucun automatisme ne bascule la grille au jour
 * dit — c'est l'activation, et elle seule, qui applique. Sans cette phrase, on
 * prépare la grille de janvier en croyant qu'elle s'appliquera toute seule.
 */
export function SavePricingGridWindow({
  open,
  onOpenChange,
  nextVersion,
  saving,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextVersion: number;
  saving: boolean;
  onConfirm: (effectiveDate: string) => void;
}) {
  const [date, setDate] = useState(today());

  // Rouvrir ne doit pas hériter d'une date abandonnée.
  useEffect(() => {
    if (open) setDate(today());
  }, [open]);

  return (
    <ReusableWindow<Record<string, never>>
      open={open}
      onOpenChange={onOpenChange}
      title={UI.TITLE}
      useHooks={noWindowHooks}
      preventClose
      className="max-w-lg"
      renderBody={() => (
        <div className="space-y-4" data-testid="pricing-save-window">
          <p className="text-sm text-muted-foreground">
            {UI.LEAD(nextVersion).replace(/\*\*/g, '')}
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="pricing-effective-date">{UI.EFFECTIVE_DATE}</Label>
            {/*
              * Le calendrier est **pose dans la fenetre**, non dans une
              * surcouche.
              *
              * `FormDatePicker` ouvre un `Popover` : dans une boite de
              * dialogue courte, il n'a la place ni dessous — il deborde — ni
              * dessus — il recouvre le titre. Le probleme n'est pas le
              * composant, qui va bien partout ailleurs, mais l'endroit : cette
              * fenetre n'a qu'un seul champ, et c'est une date. Autant la
              * montrer.
              *
              * Meme calendrier de la charte, memes conversions `YYYY-MM-DD`
              * que le composant partage — jamais `<input type="date">`, dont
              * le navigateur impose l'apparence.
              */}
            {/* `w-fit` : le cadre epouse le calendrier. Etale sur toute la
                largeur, les listes de mois se centraient sur le cadre pendant
                que la grille restait a gauche — deux alignements pour un seul
                objet. */}
            <div
              data-testid="pricing-effective-date"
              className="w-fit rounded-lg border border-border p-2"
            >
              <Calendar
                mode="single"
                captionLayout="dropdown"
                startMonth={new Date(new Date().getFullYear() - 1, 0)}
                endMonth={new Date(new Date().getFullYear() + 5, 11)}
                defaultMonth={formatDateStringToDate(date) ?? undefined}
                selected={formatDateStringToDate(date) ?? undefined}
                onSelect={(d) => setDate(formatDateToValue(d))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {UI.EFFECTIVE_HINT}
            </p>
          </div>
        </div>
      )}
      renderFooter={() => (
        <>
          <Button
            type="button"
            variant="outline"
            data-testid="pricing-save-cancel"
            onClick={() => onOpenChange(false)}
          >
            {UI.CANCEL}
          </Button>
          <Button
            type="button"
            disabled={saving || !date}
            data-testid="pricing-save-confirm"
            onClick={() => onConfirm(date)}
          >
            {UI.CONFIRM}
          </Button>
        </>
      )}
    />
  );
}
