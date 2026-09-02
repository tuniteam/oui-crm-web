/**
 * Constantes partagees par les listes.
 *
 * Elles etaient repetees a l'identique dans chaque tableau : `'ALL'` dans
 * trois ecrans, le delai de debounce dans quatre. Une valeur dupliquee finit
 * par diverger a la premiere retouche — c'est deja arrive ici, un tableau
 * filtrait a 400 ms quand les autres attendaient 500 ms.
 */

/** Identifiant de la colonne d'actions. Le tableau partage s'en sert pour
 *  l'epingler a droite ; les quatre listes doivent donc la nommer ainsi. */
export const ACTIONS_COLUMN_ID = 'actions';

/** Valeur du choix « tous » dans les selecteurs de filtre. Un `<Select>` Radix
 *  refuse la chaine vide comme valeur d'option, d'ou ce jeton explicite. */
export const FILTER_ALL = 'ALL';

/** Delai avant de relancer la requete quand un filtre change. */
export const FILTER_DEBOUNCE_MS = 500;
