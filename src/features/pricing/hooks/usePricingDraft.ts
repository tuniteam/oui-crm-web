import { useCallback, useMemo, useState } from 'react';
import * as edit from '../utils/grid-edit';
import type { PricingGridContent, SetupFeeNature } from '../types/pricingGrid';

/**
 * Ou poser une valeur dans le contenu — un chemin, jamais un index nu.
 *
 * Les options et les prestations sont adressees par leur **rang dans le
 * tableau**, non par leur `id` : depuis SPEC-19 un element nouveau n'en a pas
 * encore, le serveur le lui donnant a l'enregistrement. Le rang n'a de sens
 * qu'ici, dans un brouillon qui ne bouge pas sous nos pieds ; sur le fil,
 * c'est `id` qui identifie, et lui seul.
 */
export type PriceCell =
  | { kind: 'subscription'; plan: string; bracket: number }
  | { kind: 'option'; index: number; bracket: number }
  | { kind: 'setup'; key: string; plan: string; bracket: number }
  | { kind: 'extra'; index: number };

/**
 * Les gestes d'ajout et de retrait, tels que l'écran les consomme.
 *
 * Déclarés à part pour que le tiroir les reçoive en un seul objet plutôt qu'en
 * douze props : ils vont toujours ensemble, et ils sont tous absents en
 * lecture.
 */
export type GridOps = {
  addBracket: (index: number) => void;
  removeBracket: (index: number) => void;
  setBracketBound: (index: number, max: number | null) => void;
  addPlan: (name: string) => void;
  removePlan: (name: string) => void;
  addOption: () => void;
  /** La franchise d'une option : ce que l'abonnement couvre avant facturation. */
  setOptionIncluded: (index: number, value: number) => void;
  removeOption: (index: number) => void;
  addExtra: () => void;
  removeExtra: (index: number) => void;
  addSetupFee: (label: string, nature: SetupFeeNature) => void;
  removeSetupFee: (key: string) => void;
  setSetupNature: (key: string, nature: SetupFeeNature) => void;
};

/** Un libellé modifiable : ceux qui s'impriment sur le devis. */
export type LabelCell =
  | { kind: 'bracket'; index: number; field: 'label' | 'min' | 'max' }
  | { kind: 'option'; index: number }
  | { kind: 'setup'; key: string }
  | { kind: 'extra'; index: number };

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
    /*
     * Les deux structures n'ont plus forcement la meme forme.
     *
     * Tant qu'on ne faisait que changer des valeurs, `draft` et `source`
     * avaient exactement les memes cles. Depuis qu'on ajoute et qu'on retire
     * des elements, une strate de plus donne `source.brackets[6] ===
     * undefined` : descendre dedans lisait `undefined.max` et faisait tomber
     * l'ecran. Un cote qui n'est pas un objet arrete la descente et compte
     * pour une modification — ce qu'un element ajoute ou retire est.
     */
    const walk = (a: unknown, b: unknown) => {
      const bothObjects =
        typeof a === 'object' && a !== null && typeof b === 'object' && b !== null;
      if (!bothObjects) {
        if (a !== b) n += 1;
        return;
      }
      const keys = new Set([
        ...Object.keys(a as object),
        ...Object.keys(b as object),
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
        const o = next.options?.[cell.index];
        if (o) o.unitPrice[cell.bracket] = value;
      } else if (cell.kind === 'setup') {
        const post = next.setupFees?.[cell.key] as
          | Record<string, number[]>
          | undefined;
        if (post?.[cell.plan]) post[cell.plan][cell.bracket] = value;
      } else {
        const e = next.extras?.[cell.index];
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
        const o = next.options?.[cell.index];
        if (o) o.name = value;
      } else if (cell.kind === 'setup') {
        const post = next.setupFees?.[cell.key];
        /* On écrit `label`, **jamais la clé**. Depuis SPEC-19 c'est `nature`
           qui porte la ventilation, mais la clé reste l'adresse du poste :
           la régénérer depuis le libellé déplacerait ses prix. */
        if (post) post.label = value;
      } else {
        const e = next.extras?.[cell.index];
        if (e) e.name = value;
      }
      return next;
    });
  }, []);

  /**
   * Ajouter et retirer — SPEC-19.
   *
   * Le hook ne fait que **poser** les opérations sur le brouillon : les
   * invariants vivent dans `grid-edit`, pur et éprouvé sans rendu. Le compte
   * de modifications les suit sans rien de particulier, puisqu'il se mesure
   * sur le contenu.
   */
  const apply = useCallback(
    (op: (c: PricingGridContent) => PricingGridContent) =>
      setDraft((prev) => (prev ? op(clone(prev)) : prev)),
    [],
  );

  const ops: GridOps = useMemo(
    () => ({
      addBracket: (index: number) => apply((c) => edit.addBracket(c, index)),
      removeBracket: (index: number) => apply((c) => edit.removeBracket(c, index)),
      setBracketBound: (index: number, max: number | null) =>
        apply((c) => edit.setBracketBound(c, index, max)),
      addPlan: (name: string) => apply((c) => edit.addPlan(c, name)),
      removePlan: (name: string) => apply((c) => edit.removePlan(c, name)),
      addOption: () => apply(edit.addOption),
      setOptionIncluded: (index: number, value: number) =>
        apply((c) => {
          const o = c.options?.[index];
          /* `0` s'ecrit `0`, pas `undefined` : le contrat accepte un nombre
             positif ou nul, et retirer la cle changerait le sens en « rien
             n'est compris » de facon implicite. */
          if (o) o.included = Math.max(0, Math.round(value));
          return c;
        }),
      removeOption: (index: number) => apply((c) => edit.removeOption(c, index)),
      addExtra: () => apply(edit.addExtra),
      removeExtra: (index: number) => apply((c) => edit.removeExtra(c, index)),
      addSetupFee: (label: string, nature: SetupFeeNature) =>
        apply((c) => edit.addSetupFee(c, label, nature)),
      removeSetupFee: (key: string) => apply((c) => edit.removeSetupFee(c, key)),
      setSetupNature: (key: string, nature: SetupFeeNature) =>
        apply((c) => {
          const post = c.setupFees?.[key];
          if (post) post.nature = nature;
          return c;
        }),
    }),
    [apply],
  );

  return {
    draft,
    editing: draft !== null,
    dirtyCount,
    start,
    stop,
    setPrice,
    setLabel,
    ...ops,
  };
}
