/**
 * Le tableau vide **partagé**, pour les replis `?? []`.
 *
 * `query.data ?? []` fabrique un tableau neuf **à chaque rendu** tant que la
 * requête n'a pas de données — désactivée, en erreur, ou en vol. Une identité
 * qui change à chaque rendu invalide tout `useMemo` qui la reçoit en
 * dépendance, et par ricochet tout effet qui dépend de ce mémo.
 *
 * Sur la liste des organismes, cet enchaînement allait jusqu'à une boucle de
 * navigation : trois hooks rendaient des tableaux neufs, le mémo des critères
 * se recalculait, l'effet qui écrit l'URL repartait, la navigation provoquait
 * un rendu, et ainsi de suite. Voir `OrganizationsTable`, effet de synchro.
 *
 * `never[]` s'assigne à n'importe quel `T[]` : une seule constante suffit pour
 * tous les types. Ne jamais la muter — c'est la même pour tout le monde.
 */
export const EMPTY_ARRAY: never[] = [];
