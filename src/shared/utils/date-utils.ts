
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
 * Date courte francaise, « 31/08/2026 ».
 *
 * Trois ecrans ecrivaient chacun leur propre `toLocaleDateString('fr-FR')`,
 * avec trois traitements differents de la valeur absente : `null`, un repli
 * maison, et rien du tout — ce dernier affichant « Invalid Date » a
 * l'utilisateur. Renvoie une chaine vide, chaque appelant appliquant ensuite
 * son propre repli.
 */
export function formatShortDateFr(
  value: string | Date | null | undefined,
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
}
