import { useCallback, useMemo } from 'react';
import { useReferenceItems } from './useReferenceItems';
import type { ReferenceCategory } from '../types/reference-items';

/**
 * Traduit une cle de referentiel en libelle.
 *
 * Vit a cote de la feature qui possede les referentiels, et non dans celle qui
 * les consomme : `type`, `solution`, `leadSource`, `tags` et `services` sont
 * lus par les organismes, mais aussi par les contacts, les actions et les
 * campagnes a venir.
 *
 * `type`, `solution`, `leadSource`, `tags[]` et `services[]` sont des cles de
 * `ReferenceItem`, propres au projet — jamais des listes en dur. Une cle
 * inconnue est rendue telle quelle plutot que masquee : une fiche peut porter
 * une valeur devenue inactive, et l'effacer donnerait une colonne vide sans
 * explication.
 */
export function useReferenceLabels() {
  const { items, loading } = useReferenceItems();

  const byCategory = useMemo(() => {
    const map = new Map<ReferenceCategory, Map<string, string>>();
    for (const item of items) {
      const bucket = map.get(item.category) ?? new Map<string, string>();
      bucket.set(item.key, item.label);
      map.set(item.category, bucket);
    }
    return map;
  }, [items]);

  // Memoises : recrees a chaque rendu, ils invalideraient les `useMemo` des
  // appelants — les colonnes de tableau se reconstruiraient a chaque frappe.
  const labelOf = useCallback(
    (category: ReferenceCategory, key: string | null | undefined) =>
      key ? (byCategory.get(category)?.get(key) ?? key) : null,
    [byCategory],
  );

  /**
   * Valeurs actives d'une categorie, pour alimenter un selecteur.
   *
   * Les listes sont pre-calculees une fois par categorie : les rendre a la
   * demande refiltrait et retriait l'ensemble des referentiels a chaque rendu.
   */
  const optionsByCategory = useMemo(() => {
    const map = new Map<ReferenceCategory, { value: string; label: string }[]>();
    for (const item of items) {
      if (!item.active) continue;
      const bucket = map.get(item.category) ?? [];
      bucket.push({ value: item.key, label: item.label });
      map.set(item.category, bucket);
    }
    for (const [category, bucket] of map) {
      const order = new Map(items.map((i) => [i.key, i.order]));
      bucket.sort((a, b) => (order.get(a.value) ?? 0) - (order.get(b.value) ?? 0));
      map.set(category, bucket);
    }
    return map;
  }, [items]);

  const optionsOf = useCallback(
    (category: ReferenceCategory) => optionsByCategory.get(category) ?? [],
    [optionsByCategory],
  );

  return { labelOf, optionsOf, loading };
}
