import { OPENING_DAYS, type OpeningDay, type OpeningHours } from '../types/organizationDetail';

/** Une ligne du tableau : les jours qui partagent exactement les mêmes créneaux. */
export type OpeningGroup = {
  days: OpeningDay[];
  /** Vide = fermé. Le contrat n'envoie jamais de créneau vide, il omet le jour. */
  slots: string[];
  /** Les jours se suivent dans la semaine : le libellé peut s'écrire en plage. */
  consecutive: boolean;
};

/**
 * Regroupe la semaine par horaires identiques.
 *
 * Le contrat rend une liste de jours ouverts et **omet** les jours de
 * fermeture. Rendre cette liste telle quelle affiche sept lignes dont cinq
 * répètent la même chose, et laisse muets les jours absents — dans un volet
 * latéral, c'est 250 pixels pour une information qui en vaut 70, et une mairie
 * qui ne déclare qu'un jour paraît n'être jamais fermée.
 *
 * Le regroupement n'ajoute aucune règle métier : deux jours ne se rejoignent
 * que si leurs créneaux sont **exactement** les mêmes, dans le même ordre. Ce
 * qui est affiché reste littéralement ce que la mairie a déclaré, écrit comme
 * elle l'écrirait — « lundi – vendredi », ou « lundi, mercredi, vendredi »
 * quand les jours ne se suivent pas.
 */
export function groupOpeningHours(hours: OpeningHours): OpeningGroup[] {
  const slotsOf = (day: OpeningDay) =>
    hours.days.find((d) => d.day === day)?.slots ?? [];

  /* La signature inclut l'ordre : « matin, après-midi » et « après-midi,
     matin » ne décrivent pas la même semaine, même à créneaux égaux. */
  const groups = new Map<string, OpeningGroup>();

  for (const day of OPENING_DAYS) {
    const slots = slotsOf(day);
    const key = slots.join('|');
    const existing = groups.get(key);
    if (existing) existing.days.push(day);
    else groups.set(key, { days: [day], slots, consecutive: false });
  }

  return [...groups.values()]
    .map((g) => ({ ...g, consecutive: isConsecutive(g.days) }))
    /*
     * Les jours ouverts d'abord, la fermeture ensuite.
     *
     * L'ordre naturel de la semaine ferait remonter « Fermé » en tête d'une
     * mairie qui n'ouvre que le mercredi — l'inverse de la facon dont des
     * horaires s'ecrivent, et de ce qu'on cherche en les lisant. L'ordre de la
     * semaine est conserve a l'interieur de chaque camp.
     */
    .sort((a, b) => Number(a.slots.length === 0) - Number(b.slots.length === 0));
}

/** Les jours se suivent-ils sans trou, dans l'ordre de la semaine ? */
function isConsecutive(days: OpeningDay[]): boolean {
  if (days.length < 2) return false;
  const indexes = days.map((d) => OPENING_DAYS.indexOf(d));
  return indexes.every((n, i) => i === 0 || n === indexes[i - 1] + 1);
}

/**
 * Le libellé d'un groupe : « Lundi – vendredi », « Lundi, mercredi, vendredi »,
 * ou « Lundi ».
 *
 * Seuls les jours qui se suivent s'écrivent en plage : une énumération dit
 * lundi, mercredi et vendredi, une plage dirait aussi mardi et jeudi.
 */
export function labelOfGroup(
  group: OpeningGroup,
  labelOf: (day: OpeningDay) => string,
): string {
  const [first] = group.days;
  const last = group.days[group.days.length - 1];

  if (group.days.length === 1) return labelOf(first);

  // Le premier jour porte la majuscule, les suivants sont dans la phrase.
  const lower = (day: OpeningDay) => labelOf(day).toLocaleLowerCase('fr-FR');

  if (group.consecutive) return `${labelOf(first)} – ${lower(last)}`;

  return [labelOf(first), ...group.days.slice(1).map(lower)].join(', ');
}

/** Une journée dans l'éditeur : ouverte ou non, un ou deux créneaux. */
export type DayDraft = {
  day: OpeningDay;
  open: boolean;
  /** Bornes saisies, `['08:30', '12:30', '13:30', '17:00']` au plus. */
  ranges: { from: string; to: string }[];
};

/** Les sept jours, dans l'ordre, tels que la fenêtre les édite. */
export function toDrafts(hours?: OpeningHours | null): DayDraft[] {
  return OPENING_DAYS.map((day) => {
    const slots = hours?.days.find((d) => d.day === day)?.slots ?? [];
    return {
      day,
      open: slots.length > 0,
      ranges: slots.map((s) => {
        const [from, to] = s.split('-');
        return { from, to };
      }),
    };
  });
}

/**
 * Ce que l'API laisse passer, et que l'éditeur doit refuser.
 *
 * Éprouvé en direct : le serveur accepte `17:00-09:00`, deux créneaux qui se
 * chevauchent, l'après-midi avant le matin, et **deux entrées pour le même
 * jour**. Aucune de ces quatre valeurs n'est rattrapable à l'affichage — la
 * dernière fait même disparaître une journée en silence, la lecture ne
 * retenant que la première entrée. Elles s'arrêtent donc ici.
 *
 * Le jour en double est structurellement impossible : la fenêtre édite sept
 * lignes fixes.
 */
export function validateDrafts(drafts: DayDraft[]): Record<string, OpeningIssue> {
  const errors: Record<string, OpeningIssue> = {};

  for (const d of drafts) {
    if (!d.open) continue;

    const filled = d.ranges.filter((r) => r.from && r.to);
    if (filled.length !== d.ranges.length || filled.length === 0) {
      errors[d.day] = 'INCOMPLETE';
      continue;
    }

    if (filled.some((r) => r.to <= r.from)) {
      errors[d.day] = 'BACKWARDS';
      continue;
    }

    /*
     * Compare les créneaux **dans l'ordre horaire**, pas dans l'ordre de
     * saisie : quelqu'un qui renseigne l'après-midi avant le matin décrit une
     * journée valide, et la sortie les remet en ordre de toute façon. Le
     * refuser ferait passer une saisie juste pour une faute.
     *
     * Comparaison de chaînes « HH:mm » : l'ordre lexical y est l'ordre horaire.
     */
    const [first, second] = [...filled].sort((a, b) => a.from.localeCompare(b.from));
    if (second && second.from < first.to) {
      errors[d.day] = 'OVERLAP';
    }
  }

  return errors;
}

/**
 * La cause d'un refus, pas sa phrase.
 *
 * L'utilitaire ne connait pas la langue de l'interface : les libelles vivent
 * dans les constantes, comme partout ailleurs dans le projet. C'est aussi ce
 * qui permet de l'eprouver sans rien afficher.
 */
export type OpeningIssue = 'INCOMPLETE' | 'BACKWARDS' | 'OVERLAP';

/**
 * Ce qui part au serveur.
 *
 * `null` et non un tableau vide quand plus rien n'est ouvert : le contrat
 * efface sur `null`, tandis que `days: []` est accepté et **stocké** — la
 * fiche paraîtrait vide sans l'être. Les créneaux sont remis dans l'ordre
 * chronologique, que l'API ne garantit pas.
 */
export function toOpeningHours(
  drafts: DayDraft[],
  comment: string,
): OpeningHours | null {
  const days = drafts
    .filter((d) => d.open && d.ranges.length > 0)
    .map((d) => ({
      day: d.day,
      slots: [...d.ranges]
        .sort((a, b) => a.from.localeCompare(b.from))
        .map((r) => `${r.from}-${r.to}`),
    }));

  if (days.length === 0) return null;

  const trimmed = comment.trim();
  return { days, ...(trimmed ? { comment: trimmed } : {}) };
}

/**
 * L'heure a partir de laquelle un creneau est un apres-midi.
 *
 * Le contrat plafonne a deux creneaux mais **ne dit pas** que le premier soit
 * un matin : une structure ouverte 14:00 – 18:00 n'en a qu'un, et c'est un
 * apres-midi. Placer par le rang le ferait tomber dans la colonne du matin.
 */
const AFTERNOON_FROM = '13:00';

/**
 * Range les creneaux d'une journee en deux colonnes, matin et apres-midi.
 *
 * Aligner simplement a droite ferait glisser un unique creneau du matin sous
 * la colonne de l'apres-midi : une mairie ouverte le samedi matin paraitrait
 * ouverte le samedi apres-midi. Le decoupage se fait donc sur l'heure de
 * debut, jamais sur le rang.
 *
 * Rend deux cases, `null` quand la demi-journee est vide. Deux creneaux du
 * meme cote — cas non observe, mais rien ne l'interdit au contrat — restent
 * cote a cote dans leur colonne plutot que d'etre perdus.
 */
export function toHalfDays(slots: string[]): [string[], string[]] {
  const morning: string[] = [];
  const afternoon: string[] = [];
  for (const slot of slots) {
    // Comparaison de chaines « HH:mm » : l'ordre lexical y est l'ordre horaire.
    (slot.slice(0, 5) < AFTERNOON_FROM ? morning : afternoon).push(slot);
  }
  return [morning, afternoon];
}
