import { useCallback, useMemo, useState } from 'react';
import type { OverrideState } from '../constants/overrides.constants';
import type { UserDetailsResponse } from '../types/userDetails';

/**
 * Le brouillon des exceptions d'un utilisateur — US-00-05 §4.
 *
 * **L'état de départ se reconstitue, il ne se lit pas.** `GET /users/:id` rend
 * les droits *effectifs* : un droit retiré y est simplement **absent**, sans
 * trace. Vérifié dans `applyOverrides` côté API — un retrait supprime l'entrée
 * du rôle. Impossible donc de distinguer « le rôle ne l'accorde pas » de
 * « le rôle l'accorde et on l'a retiré » depuis cette seule réponse.
 *
 * D'où les droits du rôle en second ingrédient : le rôle accorde `A`, les
 * droits effectifs ne contiennent pas `A` → `A` a été retiré. Et un droit
 * effectif marqué `source: 'OVERRIDE'` a été ajouté.
 *
 * Tout se passe en mémoire : `PATCH` remplace l'ensemble, une écriture par
 * case ferait autant d'appels que de droits.
 */
export function useOverrideDraft(
  user: UserDetailsResponse | null,
  roleCodes: readonly string[],
) {
  const [draft, setDraft] = useState<Map<string, OverrideState> | null>(null);

  const origin = useMemo(() => {
    const map = new Map<string, OverrideState>();
    if (!user) return map;

    const effective = new Map(user.permissions.map((p) => [p.code, p]));
    for (const p of user.permissions) {
      if (p.source === 'OVERRIDE') map.set(p.code, 'GRANTED');
    }
    for (const code of roleCodes) {
      if (!effective.has(code)) map.set(code, 'REMOVED');
    }
    return map;
  }, [user, roleCodes]);

  const start = useCallback(() => setDraft(new Map(origin)), [origin]);
  const stop = useCallback(() => setDraft(null), []);

  /** L'état affiché : celui du brouillon s'il existe, sinon celui du serveur. */
  const valueOf = useCallback(
    (code: string): OverrideState => (draft ?? origin).get(code) ?? 'INHERITED',
    [draft, origin],
  );

  const setCell = useCallback((code: string, value: OverrideState) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      /* « Hérité » n'est pas un état à envoyer : c'est l'absence d'exception. */
      if (value === 'INHERITED') next.delete(code);
      else next.set(code, value);
      return next;
    });
  }, []);

  const dirtyCount = useMemo(() => {
    if (!draft) return 0;
    const codes = new Set([...origin.keys(), ...draft.keys()]);
    let n = 0;
    for (const code of codes) {
      if (origin.get(code) !== draft.get(code)) n += 1;
    }
    return n;
  }, [draft, origin]);

  /** Combien de droits s'écartent du rôle, pour l'en-tête d'un module. */
  const adjustedCount = useCallback(
    (codes: string[]) => {
      const map = draft ?? origin;
      return codes.filter((code) => map.has(code)).length;
    },
    [draft, origin],
  );

  /** Ce qui part au serveur : l'ensemble complet, les deux tableaux toujours. */
  const payload = useCallback(() => {
    const map = draft ?? origin;
    const added: string[] = [];
    const removed: string[] = [];
    for (const [code, state] of map) {
      if (state === 'GRANTED') added.push(code);
      else if (state === 'REMOVED') removed.push(code);
    }
    return { added, removed };
  }, [draft, origin]);

  const counts = useMemo(() => {
    const map = draft ?? origin;
    let added = 0;
    let removed = 0;
    for (const state of map.values()) {
      if (state === 'GRANTED') added += 1;
      else removed += 1;
    }
    return { added, removed };
  }, [draft, origin]);

  return {
    editing: draft !== null,
    valueOf,
    setCell,
    adjustedCount,
    dirtyCount,
    counts,
    payload,
    start,
    stop,
  };
}
