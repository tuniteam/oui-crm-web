/**
 * Le mois affiche, en jours — L1 · US-01-09.
 *
 * Tout se calcule sur des chaines `YYYY-MM-DD` et des composants de date, pas
 * sur des instants : `from` et `to` partent au serveur sous cette forme, et un
 * `toISOString()` sur une date locale rendrait la veille a l'ouest de
 * Greenwich.
 */

const pad = (n: number) => String(n).padStart(2, '0');

export const toDay = (y: number, m: number, d: number) =>
  `${y}-${pad(m + 1)}-${pad(d)}`;

/** Aujourd'hui, en jour local. */
export function todayDay(): string {
  const n = new Date();
  return toDay(n.getFullYear(), n.getMonth(), n.getDate());
}

/** Premier et dernier jour du mois qui contient `day`, inclusifs. */
export function monthBounds(day: string): { from: string; to: string } {
  const [y, m] = day.split('-').map(Number);
  return {
    from: toDay(y, m - 1, 1),
    to: toDay(y, m - 1, new Date(y, m, 0).getDate()),
  };
}

/** Mois precedent ou suivant, en gardant le premier jour. */
export function shiftMonth(day: string, delta: number): string {
  const [y, m] = day.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return toDay(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Les six semaines de la grille, du lundi au dimanche.
 *
 * On rend toujours des semaines pleines : une grille dont la premiere ligne
 * commence un jeudi se lit mal, et les jours voisins servent de reperes.
 */
export function monthGrid(day: string): string[][] {
  const [y, m] = day.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  // `getDay()` rend 0 pour dimanche : on ramene la semaine au lundi.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(y, m - 1, 1 - offset);

  const weeks: string[][] = [];
  for (let w = 0; w < 6; w += 1) {
    const week: string[] = [];
    for (let d = 0; d < 7; d += 1) {
      const cur = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + w * 7 + d,
      );
      week.push(toDay(cur.getFullYear(), cur.getMonth(), cur.getDate()));
    }
    weeks.push(week);
  }
  return weeks;
}

/** Le jour appartient-il au mois affiche ? Les voisins se rendent en retrait. */
export const isSameMonth = (day: string, cursor: string) =>
  day.slice(0, 7) === cursor.slice(0, 7);

const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** « septembre 2026 », sans passer par `toLocaleDateString`. */
export function monthLabel(day: string): string {
  const [y, m] = day.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** « lundi 15 septembre », pour les en-tetes de la vue liste. */
const WEEKDAYS = [
  'lundi', 'mardi', 'mercredi', 'jeudi',
  'vendredi', 'samedi', 'dimanche',
];

export function dayLabel(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const wd = (new Date(y, m - 1, d).getDay() + 6) % 7;
  return `${WEEKDAYS[wd]} ${d} ${MONTHS[m - 1]}`;
}

export const dayNumber = (day: string) => Number(day.slice(8, 10));

/**
 * La fenetre de la vue Liste — L1 · US-01-09.
 *
 * Elle **ne suit pas le curseur de mois** : la liste repond « qu'ai-je a
 * faire », pas « a quoi ressemble septembre ». Un commercial qui ouvre
 * l'agenda le 28 doit voir la semaine suivante, qui n'est pas dans le mois
 * affiche.
 *
 * Trente jours en arriere pour que l'historique recent et le retard restent
 * visibles, quatre-vingt-dix en avant pour couvrir un cycle de prospection.
 * `from` et `to` etant libres au contrat, c'est un choix d'interface.
 */
export const LIST_WINDOW = { BEFORE: 30, AFTER: 90 } as const;

export function slidingWindow(): { from: string; to: string } {
  const now = new Date();
  const at = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return toDay(d.getFullYear(), d.getMonth(), d.getDate());
  };
  return { from: at(-LIST_WINDOW.BEFORE), to: at(LIST_WINDOW.AFTER) };
}
