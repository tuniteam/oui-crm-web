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

/**
 * Un montant en euros — « 19,90 € », jamais « 20 € ».
 *
 * `formatInteger` ne convient pas a de l'argent : il arrondit et perd les
 * centimes. Un abonnement a 19,90 € s'affichait 20 €, ce qu'un commercial
 * annonce ensuite a son prospect.
 *
 * Deux decimales toujours, comme sur un devis : 129 € s'ecrit « 129,00 € ».
 */
const currencyFr = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  return currencyFr.format(value).replace(/ /g, ' ');
}

/**
 * Coupe un texte a `max` caracteres, ellipse comprise.
 *
 * L'ellipse est le caractere unique U+2026, jamais trois points : elle compte
 * pour un, et les moteurs de recherche comme les lecteurs d'ecran la
 * reconnaissent comme une troncature.
 *
 * A preferer a `truncate` CSS quand la limite doit etre la **meme partout**
 * — un nom d'organisme tient sur 25 caracteres dans l'entete de fiche comme
 * ailleurs, quelle que soit la largeur reelle du panneau.
 */
export function truncateText(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/**
 * Un identifiant d'URL tire d'un libellé : minuscules, sans accents, mots
 * reliés par un tiret simple.
 *
 * Il produit exactement ce que `^[a-z0-9]+(-[a-z0-9]+)*$` accepte — ni tiret en
 * tête ni en queue, jamais deux d'affilée — et laisse le plafond de longueur à
 * l'appelant, qui seul connaît le sien.
 *
 * `NFD` sépare la lettre de son accent (« é » → « e » + « ´ ») : on garde la
 * lettre, on jette la marque. « Périscolia Île-de-France » → « periscolia-ile-de-france ».
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Des compteurs nommés, en une énumération française.
 *
 * `{ organizations: 4, quotes: 2 }` donne « 4 organismes et 2 devis » : les
 * virgules jusqu'au dernier, « et » devant lui. Chaque clé porte son couple
 * singulier / pluriel, parce qu'« 1 devis » et « 2 devis » ne se traitent pas
 * comme « 1 organisme » et « 2 organismes ».
 *
 * Une clé inconnue s'affiche telle quelle : un référentiel qui s'allonge ne
 * doit pas faire disparaître un compteur de l'écran — mais c'est le signe
 * qu'il manque une traduction dans la table.
 */
export function describeCounts(
  counts: Record<string, number>,
  labels: Record<string, readonly [string, string]>,
): string {
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([key, n]) => {
      const [one, many] = labels[key] ?? [key, key];
      return `${formatInteger(n)} ${n > 1 ? many : one}`;
    });
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1]}`;
}
