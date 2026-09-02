import { MeStoreState } from '@/contexts/useMeStore';
import type { To } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { buildProjectMenu } from '@/config/menu-project';
import { MenuConfig } from '@/config/types';

/** Accueil neutre : des droits, mais aucun ecran encore construit qui les use. */
export const WELCOME_ROUTE = '/bienvenue';
/** Vraie absence de droits : le compte ne peut rien faire. */
export const NO_PERMISSIONS_ROUTE = '/no-permissions';

export function getAfterLoginRedirect(meStore: MeStoreState): To {
  // Tant que /me n'a pas repondu, les gardes ne savent rien : ils redirigent
  // ici, sur la route courante, en attendant. Il faut donc rendre l'URL
  // entiere — sans la query, un lien profond (?panneau=..., ?onglet=...)
  // serait perdu a chaque chargement a froid.
  if (!meStore.me) {
    return `${window.location.pathname}${window.location.search}` as To;
  }

  const permissions = meStore.getPermissionCodes();

  // Le menu a interroger depend du contact, pas de l'ecran courant.
  //
  // Un contact rattache a un projet navigue dans le menu projet. Le chercher
  // dans MENU_SIDEBAR — le menu plateforme — le condamnait : ses deux entrees
  // exigent `projects:read` et `users:read`, qu'un commercial n'a pas et ne
  // doit pas avoir. Aucune correspondance, donc « aucune permission », alors
  // que le compte en porte une trentaine.
  const projectId = meStore.getActiveProjectId();
  const menu: MenuConfig =
    !meStore.isBackoffice() && projectId
      ? buildProjectMenu(
          projectId,
          meStore.getActiveProjectName() ?? '',
          permissions,
        )
      : MENU_SIDEBAR;

  const allowed = findFirstAllowedPath(menu, permissions);
  if (allowed) return allowed;

  // Aucun ecran ne correspond. Deux situations tres differentes, qu'il ne faut
  // surtout pas confondre :
  //   - le compte n'a aucun droit : c'est une anomalie de configuration, on
  //     renvoie vers l'administrateur ;
  //   - le compte a des droits, mais ils portent sur des ecrans qui n'existent
  //     pas encore (lots suivants). Rien n'est casse, et l'envoyer vers son
  //     administrateur l'enverrait se plaindre d'un probleme inexistant.
  return permissions.length > 0 ? WELCOME_ROUTE : NO_PERMISSIONS_ROUTE;
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
