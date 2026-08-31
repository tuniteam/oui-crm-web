import { MeStoreState } from '@/contexts/useMeStore';
import type { To } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { MenuConfig } from '@/config/types';

export function getAfterLoginRedirect(meStore: MeStoreState): To {
  if (!meStore.me) {
    return window.location.pathname as To;
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
