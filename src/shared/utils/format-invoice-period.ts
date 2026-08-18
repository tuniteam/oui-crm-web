import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { COMMON } from '@/constants';
import { formatDateStringToDate } from './date-utils';

const P = COMMON.PERIOD;

/**
 * Human-readable invoice period.
 *
 *  - Single day             → "14 avr. 2026"
 *  - Same month range       → "Du 1 au 16 avr. 2026"
 *  - Cross-month same year  → "Du 28 mars au 5 avr. 2026"
 *  - Cross-month diff year  → "Du 28 déc. 2025 au 5 janv. 2026"
 *  - Open-ended (no end)    → "Depuis le 1 avr. 2026"
 *
 * Inputs are ISO date strings (YYYY-MM-DD). `periodEnd` may be null
 * for open-ended periods (e.g. a QF that hasn't been closed yet).
 * Uses formatDateStringToDate to avoid UTC timezone shift.
 */
export function formatInvoicePeriod(
  periodStart: string,
  periodEnd: string | null | undefined,
): string {
  const start = formatDateStringToDate(periodStart);
  if (!start) return '';

  if (!periodEnd) {
    return `${P.OPEN_ENDED_PREFIX} ${format(start, 'd MMM yyyy', { locale: fr })}`;
  }

  const end = formatDateStringToDate(periodEnd);
  if (!end) return '';

  if (isSameDay(start, end)) {
    return format(start, 'd MMM yyyy', { locale: fr });
  }

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${P.RANGE_PREFIX} ${start.getDate()} ${P.RANGE_SEPARATOR} ${format(end, 'd MMM yyyy', { locale: fr })}`;
  }

  const startFormat =
    start.getFullYear() === end.getFullYear() ? 'd MMM' : 'd MMM yyyy';
  return `${P.RANGE_PREFIX} ${format(start, startFormat, { locale: fr })} ${P.RANGE_SEPARATOR} ${format(end, 'd MMM yyyy', { locale: fr })}`;
}
