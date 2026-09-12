import { useCallback, useMemo, useState } from 'react';
import type { OutOfScopeAccess, Role, RoleGrant, RoleScope } from '../types/role';

/** Ce qu'une case de la matrice vaut : aucun droit, ou un droit avec sa portée. */
export type CellValue = 'NONE' | RoleScope;

/**
 * Le brouillon d'un rôle — L0 · US-00-06.
 *
 * **Tout se passe en mémoire.** Cocher une case n'appelle pas le serveur :
 * `PATCH` remplace l'ensemble des droits, une écriture par case créerait
 * soixante-dix-sept appels et autant d'états intermédiaires incohérents.
 *
 * Le compte des modifications se mesure sur le contenu et non sur les
 * frappes : revenir à la valeur d'origine annule la modification. C'est aussi
 * lui qui évite le `400 EMPTY_UPDATE_PAYLOAD` — sans changement, on
 * n'envoie rien.
 */
export function useRoleDraft(role: Role | null) {
  const [grants, setGrants] = useState<Map<string, RoleScope> | null>(null);
  const [outOfScope, setOutOfScope] = useState<OutOfScopeAccess | null>(null);

  const origin = useMemo(() => {
    const map = new Map<string, RoleScope>();
    for (const g of role?.permissions ?? []) map.set(g.code, g.scope);
    return map;
  }, [role]);

  const start = useCallback(() => {
    if (!role) return;
    setGrants(new Map(origin));
    setOutOfScope(role.outOfScopeAccess);
  }, [role, origin]);

  const stop = useCallback(() => {
    setGrants(null);
    setOutOfScope(null);
  }, []);

  /** La valeur affichée : celle du brouillon s'il existe, sinon celle du rôle. */
  const valueOf = useCallback(
    (code: string): CellValue => (grants ?? origin).get(code) ?? 'NONE',
    [grants, origin],
  );

  const setCell = useCallback((code: string, value: CellValue) => {
    setGrants((prev) => {
      if (!prev) return prev;
      const next = new Map(prev);
      /* Un droit retiré **disparaît** de l'ensemble : le serveur lit une
         absence, pas une portée nulle. */
      if (value === 'NONE') next.delete(code);
      else next.set(code, value);
      return next;
    });
  }, []);

  const dirtyCount = useMemo(() => {
    if (!grants || !role) return 0;
    let n = outOfScope !== role.outOfScopeAccess ? 1 : 0;
    const codes = new Set([...origin.keys(), ...grants.keys()]);
    for (const code of codes) {
      if (origin.get(code) !== grants.get(code)) n += 1;
    }
    return n;
  }, [grants, origin, outOfScope, role]);

  /** Ce qui part au serveur : l'ensemble complet, jamais les seules cases changées. */
  const payload = useCallback(() => {
    const permissions: RoleGrant[] = [...(grants ?? origin).entries()].map(
      ([code, scope]) => ({ code, scope }),
    );
    return { outOfScopeAccess: outOfScope ?? undefined, permissions };
  }, [grants, origin, outOfScope]);

  /** Combien de droits sont accordés, pour l'en-tête d'un module ou du rôle. */
  const grantedCount = useCallback(
    (codes?: string[]) => {
      const map = grants ?? origin;
      if (!codes) return map.size;
      return codes.filter((c) => map.has(c)).length;
    },
    [grants, origin],
  );

  return {
    editing: grants !== null,
    outOfScope: outOfScope ?? role?.outOfScopeAccess ?? 'NONE',
    setOutOfScope,
    valueOf,
    setCell,
    grantedCount,
    dirtyCount,
    payload,
    start,
    stop,
  };
}
