const FILE_SIZE_UNITS = ['o', 'Ko', 'Mo', 'Go'] as const;

/**
 * Formats a file size in bytes to a human-readable string (e.g. 254321 → "248 Ko").
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return `0 ${FILE_SIZE_UNITS[0]}`;
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  const formatted = unitIndex === 0 ? size.toString() : size.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${FILE_SIZE_UNITS[unitIndex]}`;
}

/**
 * Un entier lisible : « 149 695 » plutot que « 149695 ».
 *
 * Separateur de milliers francais — l'espace fine insecable — pour la liste
 * comme pour la fiche : deux formateurs distincts finiraient par diverger, et
 * un meme nombre ne s'ecrirait pas pareil d'un ecran a l'autre.
 *
 * Le formateur est construit une fois : `Intl.NumberFormat` est couteux a
 * instancier, et une cellule de tableau le rappellerait a chaque ligne.
 */
const integerFr = new Intl.NumberFormat('fr-FR');

/**
 * `Intl` rend une espace **fine** insecable (U+202F), presque invisible a la
 * taille d'un tableau. Les libelles que l'API renvoie — « 5 000 – 10 000 hab. »
 * — portent une espace ordinaire : cote a cote, nos nombres paraissaient ne pas
 * etre separes du tout. On garde l'insecable, mais de largeur normale.
 */
const NARROW_NBSP = / /g;
const NBSP = ' ';

export function formatInteger(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const digits = String(value).replace(/\D/g, '');
  return digits === ''
    ? ''
    : integerFr.format(Number(digits)).replace(NARROW_NBSP, NBSP);
}
