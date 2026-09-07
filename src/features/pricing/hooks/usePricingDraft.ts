import { useCallback, useMemo, useState } from 'react';
import type { PricingGridContent } from '../types/pricingGrid';

/** Où poser une valeur dans le contenu — un chemin, jamais un index nu. */
export type PriceCell =
  | { kind: 'subscription'; plan: string; bracket: number }
  | { kind: 'option'; id: number; bracket: number }
  | { kind: 'setup'; key: string; plan: string; bracket: number }
  | { kind: 'extra'; id: number };

/** Un libellé modifiable : ceux qui s'impriment sur le devis. */
export type LabelCell =
  | { kind: 'bracket'; index: number; field: 'label' | 'min' | 'max' }
  | { kind: 'option'; id: number }
  | { kind: 'setup'; key: string }
  | { kind: 'extra'; id: number };

const clone = (c: PricingGridContent): PricingGridContent =>
  JSON.parse(JSON.stringify(c)) as PricingGridContent;

/**
 * Le brouillon d'une version tarifaire — L2 · US-02-01, tranche B.
 *
 * **Tout se passe en mémoire.** Aucune saisie n'appelle le serveur : dans la
 * V8, chaque case portait un `onchange` qui écrivait aussitôt ; transposé sur
 * cette API, cela créerait **une version par case modifiée** — dix-huit
 * versions pour les dix-huit cases des frais — et il n'existe ni `PATCH` ni
 * `DELETE` pour les retirer. Une version par enregistrement, jamais par frappe.
 *
 * Le compte des modifications se mesure sur le contenu, pas sur les frappes :
 * revenir à la valeur d'origine annule la modification, comme il se doit.
 */
export function usePricingDraft(source: PricingGridContent | null) {
  const [draft, setDraft] = useState<PricingGridContent | null>(null);

  const start = useCallback(() => {
    if (source) setDraft(clone(source));
  }, [source]);

  const stop = useCallback(() => setDraft(null), []);

  /** Combien de valeurs diffèrent de la version d'origine. */
  const dirtyCount = useMemo(() => {
    if (!draft || !source) return 0;
    let n = 0;
    const walk = (a: unknown, b: unknown) => {
      if (typeof a !== 'object' || a === null || b === null) {
        if (a !== b) n += 1;
        return;
      }
      const keys = new Set([
        ...Object.keys(a as object),
        ...Object.keys((b ?? {}) as object),
      ]);
      for (const k of keys) {
        walk(
          (a as Record<string, unknown>)[k],
          (b as Record<string, unknown>)[k],
        );
      }
    };
    walk(draft, source);
    return n;
  }, [draft, source]);

  const setPrice = useCallback((cell: PriceCell, value: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      if (cell.kind === 'subscription') {
        next.subscription[cell.plan][cell.bracket] = value;
      } else if (cell.kind === 'option') {
        const o = next.options?.find((x) => x.id === cell.id);
        if (o) o.unitPrice[cell.bracket] = value;
      } else if (cell.kind === 'setup') {
        const post = next.setupFees?.[cell.key] as
          | Record<string, number[]>
          | undefined;
        if (post?.[cell.plan]) post[cell.plan][cell.bracket] = value;
      } else {
        const e = next.extras?.find((x) => x.id === cell.id);
        if (e) e.unitPrice = value;
      }
      return next;
    });
  }, []);

  const setLabel = useCallback((cell: LabelCell, value: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      if (cell.kind === 'bracket') {
        const b = next.brackets[cell.index];
        if (cell.field === 'label') b.label = value;
        else if (cell.field === 'min') b.min = Number(value) || 0;
        /* La strate ouverte garde `max: null` : vider le champ la rouvre,
           plutôt que d'y écrire un plafond inventé. */
        else b.max = value.trim() === '' ? null : Number(value) || 0;
      } else if (cell.kind === 'option') {
        const o = next.options?.find((x) => x.id === cell.id);
        if (o) o.name = value;
      } else if (cell.kind === 'setup') {
        const post = next.setupFees?.[cell.key];
        /* On écrit `label`, **jamais la clé**. Elle est reconnue par le serveur
           pour ventiler le une-fois sur le devis : la régénérer depuis le
           libellé ferait retomber la ventilation formation à zéro. */
        if (post) post.label = value;
      } else {
        const e = next.extras?.find((x) => x.id === cell.id);
        if (e) e.name = value;
      }
      return next;
    });
  }, []);

  return { draft, editing: draft !== null, dirtyCount, start, stop, setPrice, setLabel };
}
