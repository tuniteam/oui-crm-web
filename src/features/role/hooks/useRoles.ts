import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ACTION_LABELS,
  MODULE_LABELS,
  ROLES_UI,
} from '../constants/roles.constants';
import { roleService } from '../services/role.service';
import type { PermissionItem, Role } from '../types/role';

/** Un module du catalogue, avec ses droits — ce que la matrice affiche. */
export type PermissionModule = {
  key: string;
  label: string;
  permissions: { code: string; label: string }[];
};

export function useRoles() {
  const query = useQuery({
    queryKey: ['roles', 'list'],
    queryFn: roleService.getAll,
  });

  /* Effet et non corps de rendu : sinon une requête en échec réaffiche un
     toast à chaque rendu. */
  useEffect(() => {
    if (query.isError) toast.error(ROLES_UI.ERRORS.FETCH);
  }, [query.isError]);

  return {
    roles: (query.data?.data ?? []) as Role[],
    loading: query.isLoading,
  };
}

/**
 * Le catalogue des droits, groupé par module pour la matrice.
 *
 * **Rien n'est écrit en dur** : ni la liste des droits, ni leur nombre — 77
 * aujourd'hui, davantage à la prochaine livraison. Les libellés de l'API
 * étant en anglais, l'écran traduit depuis `module` et `action` ; ce qu'il ne
 * connaît pas retombe sur le libellé du serveur, lisible faute d'être
 * traduit.
 */
export function usePermissionCatalogue() {
  const query = useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: roleService.getPermissions,
  });

  const modules = useMemo<PermissionModule[]>(() => {
    const byModule = new Map<string, PermissionItem[]>();
    for (const p of query.data?.data ?? []) {
      const list = byModule.get(p.module) ?? [];
      list.push(p);
      byModule.set(p.module, list);
    }
    return [...byModule.entries()].map(([key, items]) => ({
      key,
      label: MODULE_LABELS[key] ?? key,
      permissions: items.map((p) => ({
        code: p.code,
        label: ACTION_LABELS[p.action] ?? p.label,
      })),
    }));
  }, [query.data]);

  return { modules, loading: query.isLoading };
}
