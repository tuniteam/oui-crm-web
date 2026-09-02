import { Fragment, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { buildProjectMenu } from '@/config/menu-project';
import { MenuItem } from '@/config/types';
import { useMeStore } from '@/contexts/useMeStore';
import { useProjectModeStore } from '@/contexts/useProjectModeStore';
import { useProject } from '@/features/project/hooks/useProject';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import { PROFILE_UI } from '@/features/profile/constants/profile.constants';
import { ProjectScope } from './project-switcher';

/**
 * Fil d'Ariane : la portee d'abord — le projet — puis le chemin dans le menu.
 *
 * Traitement typographique, sans aucun fond : soft-m aligne trois pastilles
 * dont la derniere est un aplat azur clair. Ici les ancetres sont en gris, la
 * page courante en encre grasse soulignee d'un filet azur, et le separateur
 * est une simple barre oblique. Les ancetres portent un filet transparent de
 * meme epaisseur, sinon le soulignement de la page courante decalerait la
 * ligne de base de ses voisins.
 *
 * Le menu resolu doit etre celui qui est affiche. En mode projet, les ecrans
 * vivent sous `/:projectId/...` : les resoudre contre `MENU_SIDEBAR`, le menu
 * plateforme, ne donnait aucune correspondance et le fil d'Ariane restait vide.
 */
/**
 * Ecrans atteints hors du menu.
 *
 * Le fil d'Ariane se resout contre le menu affiche. `/profile` s'ouvre depuis
 * le menu du compte, en pied de rail : il n'est dans aucun menu, et l'entete
 * restait donc entierement vide — l'ecran avait l'air inacheve.
 */
const OFF_MENU_TITLES: Record<string, string> = {
  '/profile': PROFILE_UI.PAGE_SUBTITLE,
};

/** Barre oblique de separation, purement decorative. */
function Slash() {
  return (
    <span aria-hidden="true" className="text-muted-foreground/40 select-none">
      /
    </span>
  );
}

/** Separation entre la portee et le chemin : le projet encadre le chemin, il
 *  n'en est pas une etape, donc pas de barre oblique ici. */
function ScopeDivider() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-px bg-border shrink-0 mx-1 self-center"
    />
  );
}

/** Filet de meme epaisseur pour tous les maillons : seul le maillon courant
 *  le montre, les autres le portent en transparent pour garder l'alignement. */
const LINK_BASE = 'pb-0.5 border-b-2 transition-colors';

export function Breadcrumb() {
  const { pathname } = useLocation();
  const { getBreadcrumb } = useMenu(pathname);

  const meStore = useMeStore();
  const isProjectMode = useProjectModeStore((s) => s.isProjectMode);
  const activeProjectId = meStore.getActiveProjectId();

  // Le nom vient du rattachement du contact quand il en a un. Un operateur
  // back-office n'en a aucun, et ouvre pourtant des projets depuis la liste :
  // son nom de projet ne peut alors venir que de l'API. C'est la bascule que
  // fait soft-m pour le nom de client.
  const nameFromRelationship = meStore.getActiveProjectName();
  const { data: fetchedProject } = useProject(
    isProjectMode && !nameFromRelationship
      ? (activeProjectId ?? undefined)
      : undefined,
  );
  const projectName = isProjectMode
    ? (nameFromRelationship ?? fetchedProject?.name ?? null)
    : null;

  const menuConfig = useMemo(() => {
    if (!isProjectMode || !activeProjectId) return MENU_SIDEBAR;
    return buildProjectMenu(
      activeProjectId,
      projectName ?? '',
      meStore.getPermissionCodes(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectMode, activeProjectId, projectName, meStore.me]);

  const menuItems: MenuItem[] = getBreadcrumb(menuConfig);
  const offMenuTitle = OFF_MENU_TITLES[pathname];
  const items: MenuItem[] =
    menuItems.length > 0
      ? menuItems
      : offMenuTitle
        ? [{ title: offMenuTitle }]
        : [];

  if (!projectName && items.length === 0) {
    return null;
  }

  const lastItem = items[items.length - 1];

  return (
    <div className="flex items-center gap-1.5 text-xs lg:text-sm font-medium min-w-0">
      {/* Mobile : la portee, puis le seul dernier maillon. */}
      <div className="flex lg:hidden items-center gap-1.5 min-w-0">
        {projectName && (
          <Fragment>
            <ProjectScope projectName={projectName} compact />
            {lastItem && <ScopeDivider />}
          </Fragment>
        )}
        {lastItem && (
          <span
            className={cn(
              LINK_BASE,
              'border-primary text-foreground font-semibold text-xs truncate min-w-0',
            )}
          >
            {lastItem.title}
          </span>
        )}
      </div>

      <div className="hidden lg:flex items-center gap-1.5 min-w-0">
        {projectName && (
          <Fragment>
            <ProjectScope projectName={projectName} />
            {items.length > 0 && <ScopeDivider />}
          </Fragment>
        )}
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`root-${index}`}>
              <span
                className={cn(
                  LINK_BASE,
                  'truncate',
                  last
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {item.title}
              </span>
              {!last && <Slash key={`sep-${index}`} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

