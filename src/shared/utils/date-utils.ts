import { format } from 'date-fns';

/**
 * Converts a date string (ISO or YYYY-MM-DD) to a Date object.
 */
export function formatDateStringToDate(
  value: string | undefined,
): Date | undefined {
  if (value == null || value.trim() === '') return undefined;
  const dateStr = value.includes('T') ? value : value + 'T00:00:00';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Converts a Date object to a YYYY-MM-DD string for API payloads.
 */
export function formatDateToValue(date: Date | undefined): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date to a French locale string (e.g. "13 mars 2026").
 */
export function formatToFrenchDate(date: Date | undefined | null): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a Date (or ISO string) to "dd/MM/yy HH:mm" — short date + time.
 */
export function formatToShortDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';
  return format(date, 'dd/MM/yy HH:mm');
}

/**
 * Formats a Date to dd/MM/yyyy string.
 */
export const formatDateToString = (
  date: Date | undefined | null,
): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  return format(date, 'dd/MM/yyyy');
};

/**
 * Formats a Date to YYYY-MM-DD string for API requests.
 */
export const formatDateToApiString = (
  date: Date | undefined | null,
): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Converts a date string to a YYYY-MM-DD form value.
 */
export function toFormDate(value: string | undefined): string {
  if (!value?.trim()) return '';
  const date = formatDateStringToDate(value);
  return date ? formatDateToValue(date) : value.substring(0, 10);
}

/**
 * Formats a period start date to a "month YYYY" French locale string
 * (e.g. "2026-04-01" → "avril 2026"). Returns null if invalid.
 */
export function formatPeriodMonthYear(periodStart?: string): string | null {
  if (!periodStart) return null;
  const d = new Date(periodStart);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

// Seuil d'affichage de l'âge en mois (tranche crèche 0-3 ans) ; au-delà → années.
const AGE_MONTHS_DISPLAY_THRESHOLD = 36;

/**
 * Âge formaté selon la convention crèche :
 * en mois jusqu'à 3 ans (« 8 mois », « 30 mois »), puis en années (« 3 ans »).
 * Retourne null si la date est absente/invalide.
 */
export function formatAge(birthDate: string | undefined): string | null {
  const birth = formatDateStringToDate(birthDate);
  if (!birth) return null;
  const today = new Date();
  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;
  if (months < AGE_MONTHS_DISPLAY_THRESHOLD) return `${months} mois`;
  return `${Math.floor(months / 12)} ans`;
}
