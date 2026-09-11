import { Calendar } from '@/components/ui/calendar';
import {
  formatDateStringToDate,
  formatDateToValue,
} from '@/shared/utils/date-utils';
import { PRICING_CALENDAR } from '../constants/pricing.constants';

/**
 * Le calendrier **posé dans la fenêtre**, non dans une surcouche.
 *
 * `FormDatePicker` ouvre un `Popover` : dans une boîte de dialogue courte, il
 * n'a la place ni dessous — il déborde — ni dessus — il recouvre le titre. Le
 * problème n'est pas le composant, qui va bien partout ailleurs, mais
 * l'endroit : ces fenêtres n'ont qu'un champ, et c'est une date. Autant la
 * montrer.
 *
 * Mêmes conversions `YYYY-MM-DD` que le composant partagé — jamais
 * `<input type="date">`, dont le navigateur impose l'apparence.
 *
 * Écrit une fois : l'enregistrement et l'activation le posaient à l'identique,
 * bornes comprises, et deux copies d'un même réglage divergent en silence.
 */
export function InlineCalendar({
  value,
  onChange,
  testId,
}: {
  /** `YYYY-MM-DD`, ou vide quand aucune date n'est choisie. */
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  const selected = formatDateStringToDate(value) ?? undefined;
  const year = new Date().getFullYear();

  return (
    /* `w-fit` : le cadre épouse le calendrier. Étalé sur toute la largeur, les
       listes de mois se centraient sur le cadre pendant que la grille restait
       à gauche — deux alignements pour un seul objet. */
    <div data-testid={testId} className="w-fit rounded-lg border border-border p-2">
      <Calendar
        mode="single"
        captionLayout="dropdown"
        startMonth={new Date(year - PRICING_CALENDAR.YEARS_BACK, 0)}
        endMonth={new Date(year + PRICING_CALENDAR.YEARS_AHEAD, 11)}
        defaultMonth={selected}
        selected={selected}
        onSelect={(d) => onChange(formatDateToValue(d))}
      />
    </div>
  );
}
