import { MeStoreState } from '@/contexts/useMeStore';
import type { To } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { MenuConfig } from '@/config/types';

export function getAfterLoginRedirect(meStore: MeStoreState): To {
  // Tant que /me n'a pas repondu, les gardes ne savent rien : ils redirigent
  // ici, sur la route courante, en attendant. Il faut donc rendre l'URL
  // entiere — sans la query, un lien profond (?panneau=..., ?onglet=...)
  // serait perdu a chaque chargement a froid.
  if (!meStore.me) {
    return `${window.location.pathname}${window.location.search}` as To;
  }
  

  const permissions = meStore.getPermissionCodes();
  const menu=MENU_SIDEBAR;

  if (menu && permissions)
    return (
      findFirstAllowedPath(menu, permissions) ??
      '/no-permissions'
      
    );

  return '/no-permissions'
}

function findFirstAllowedPath(
  menu: MenuConfig,
  permissions: string[],
): To | undefined {
  for (const item of menu) {
    if (item.activeProject) continue;

    if (item.path && !item.heading && !item.disabled) {
      if (!item.readPermission || permissions.includes(item.readPermission)) {
        return item.path;
      }
    }

    if (item.children) {
      const childPath = findFirstAllowedPath(item.children, permissions);
      if (childPath) return childPath;
    }
  }
}
