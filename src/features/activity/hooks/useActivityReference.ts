import { useMemo } from 'react';
import { useReferenceItems } from '@/features/settings/hooks/useReferenceItems';
import { ACTIVITY_REFERENCE } from '../constants/activity.constants';

export type ActivityTypeOption = {
  key: string;
  label: string;
  /**
   * Exportable en calendrier — et surtout : **c'est ce type-la qui fait
   * basculer la fiche en « RDV planifie »**. La metadonnee sert donc a
   * l'export *et* a l'avertissement du formulaire.
   */
  ics: boolean;
  /**
   * Duree suggeree. Independante de `ics` : la visioconference en a une (30)
   * sans etre exportable. Ne jamais deduire l'un de l'autre.
   */
  defaultDurationMin: number | null;
};

export type ActivityResultOption = { key: string; label: string };

/**
 * Types et resultats d'action — L1 · US-01-08.
 *
 * Ils viennent du referentiel du projet, jamais d'une liste en dur : la
 * maquette V8 code `ACTION_TYPES` en dur, ce qui casserait des qu'un projet
 * personnalise ses libelles. Un type inconnu rend `400
 * INVALID_REFERENCE_VALUE`.
 */
export function useActivityReference(enabled = true) {
  const { items, loading } = useReferenceItems(enabled);

  const types = useMemo<ActivityTypeOption[]>(
    () =>
      items
        .filter((i) => i.category === ACTIVITY_REFERENCE.TYPE && i.active)
        .map((i) => ({
          key: i.key,
          label: i.label,
          ics: i.metadata?.ics === true,
          defaultDurationMin:
            typeof i.metadata?.defaultDurationMin === 'number'
              ? i.metadata.defaultDurationMin
              : null,
        })),
    [items],
  );

  const results = useMemo<ActivityResultOption[]>(
    () =>
      items
        .filter((i) => i.category === ACTIVITY_REFERENCE.RESULT && i.active)
        .map((i) => ({ key: i.key, label: i.label })),
    [items],
  );

  return { types, results, loading };
}
