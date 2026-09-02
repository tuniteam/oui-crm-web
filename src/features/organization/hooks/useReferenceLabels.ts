import { useMemo } from 'react';
import { useReferenceItems } from '@/features/settings/hooks/useReferenceItems';
import type { ReferenceCategory } from '@/features/settings/types/reference-items';

/**
 * Traduit une cle de referentiel en libelle.
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

  const labelOf = (category: ReferenceCategory, key: string | null | undefined) =>
    key ? (byCategory.get(category)?.get(key) ?? key) : null;

  /** Valeurs actives d'une categorie, pour alimenter un selecteur. */
  const optionsOf = (category: ReferenceCategory) =>
    items
      .filter((i) => i.category === category && i.active)
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ value: i.key, label: i.label }));

  return { labelOf, optionsOf, loading };
}
