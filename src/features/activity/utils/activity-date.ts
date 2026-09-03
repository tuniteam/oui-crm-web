/**
 * Dates et heures d'une action — L1 · US-01-08.
 *
 * Deux pieges de fuseau, tous deux verifies contre l'API en marche.
 *
 * `time` est une heure locale `HH:MM` **affichee telle quelle** : la
 * reconstruire en `Date` decalerait tous les rendez-vous d'un fuseau.
 *
 * `nextActivityAt` et `lastActivityAt` sont des horodatages a **minuit UTC**
 * (`2026-10-15T00:00:00.000Z`) alors qu'ils portent un jour. Un
 * `toLocaleDateString` afficherait la veille a l'ouest de Greenwich. On lit
 * donc la partie jour de la chaine, sans jamais construire de `Date`.
 */

/** Les dix premiers caracteres : `2026-10-15T00:00:00.000Z` → `2026-10-15`. */
export function dayOf(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

/** `2026-10-15` → `15/10/2026`, par decoupage et non par `Date`. */
export function formatDayFr(value: string | null | undefined): string {
  const day = dayOf(value);
  if (!day) return '';
  const [y, m, d] = day.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Jours d'ecart entre un jour et aujourd'hui, negatif dans le passe.
 *
 * Compare deux jours, jamais deux instants : `Date.UTC` sur les composants du
 * jour rend la difference exacte, sans heure ni fuseau.
 */
export function daysFromToday(value: string | null | undefined): number | null {
  const day = dayOf(value);
  if (!day) return null;
  const [y, m, d] = day.split('-').map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - today) / 86_400_000);
}

/** Une action planifiee a une date passee. Elle reste la « prochaine ». */
export function isLate(value: string | null | undefined): boolean {
  const diff = daysFromToday(value);
  return diff !== null && diff < 0;
}
