import { CalendarIcon } from 'lucide-react';
import {
  formatDateStringToDate,
  formatDateToValue,
  formatToFrenchDate,
} from '@/shared/utils/date-utils';
import { cn } from '@/lib/utils';
import { UI } from '@/constants/ui';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

/** Amplitude des annees proposees, de part et d'autre de l'annee courante. */
const YEAR_SPAN = 5;
const THIS_YEAR = new Date().getFullYear();

type Props = {
  /** Jour `YYYY-MM-DD`, la forme que le serveur attend. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  'data-testid'?: string;
};

/**
 * Champ date d'un formulaire — le calendrier de la charte, pas celui du
 * navigateur.
 *
 * `<input type="date">` rend le sélecteur natif de Chrome : bleu Google,
 * boutons « Effacer / Aujourd'hui » en anglais selon la langue du navigateur,
 * et aucune prise sur son apparence. Ici, un `Popover` et le `Calendar` du
 * thème, comme dans soft-m-web.
 *
 * Radix gère ses propres couches : contrairement au pop-up de MUI, ce
 * `Popover` reste cliquable dans une fenêtre modale sans réglage particulier.
 */
export function FormDatePicker({
  value,
  onChange,
  disabled,
  placeholder = UI.DATE_PICKER.PICK_DATE,
  'data-testid': testId,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-testid={testId}
          className={cn(
            'w-full justify-start text-start font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="me-2 size-4" />
          {value
            ? formatToFrenchDate(formatDateStringToDate(value))
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Mois et annee en listes deroulantes : une fin de campagne ou une
            fin d'affectation se posent souvent a un an de distance, et douze
            clics sur la fleche pour y arriver ne sont pas une saisie. */}
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(THIS_YEAR - YEAR_SPAN, 0)}
          endMonth={new Date(THIS_YEAR + YEAR_SPAN, 11)}
          defaultMonth={formatDateStringToDate(value) ?? undefined}
          selected={formatDateStringToDate(value) ?? undefined}
          onSelect={(date) => onChange(formatDateToValue(date))}
        />
      </PopoverContent>
    </Popover>
  );
}
