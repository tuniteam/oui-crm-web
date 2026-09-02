import {
  Fragment,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useMeStore } from '@/contexts/useMeStore'
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { buildProjectMenu } from '@/config/menu-project';
import { useProjectModeStore } from '@/contexts/useProjectModeStore';
import { useProject } from '@/features/project/hooks/useProject';
import { MenuConfig, MenuItem } from '@/config/types';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarMenuSkeleton } from './SidebarMenuSkeleton';

// Latences (ms) de la mise en visibilité de l'item actif :
// 1) laisser l'accordéon parent s'ouvrir, 2) attendre l'animation avant le scroll.
const SECTION_OPEN_DELAY_MS = 120;
const SCROLL_AFTER_OPEN_DELAY_MS = 220;

export function SidebarMenu() {
  const { pathname } = useLocation();
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
 
  const meStore = useMeStore();
 


  // Met l'item actif en visibilité à chaque navigation, en 2 étapes :
  // 1) on laisse l'accordéon parent s'ouvrir (géré par AccordionMenu),
  // 2) après l'animation, on fait défiler jusqu'à la feuille active.
  useEffect(() => {
    const openTimer = setTimeout(() => {
      scrollTimerRef.current = setTimeout(() => {
        const activeItem = document.querySelector<HTMLElement>(
          '.sidebar-menu-scroll [data-slot="accordion-menu-item"][data-selected="true"]',
        );
        activeItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, SCROLL_AFTER_OPEN_DELAY_MS);
    }, SECTION_OPEN_DELAY_MS);

    return () => {
      clearTimeout(openTimer);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [pathname]);
 
 

  // Memoize matchPath to prevent unnecessary re-renders
  const matchPath = useCallback(
    (path: string): boolean =>
      path === pathname ||
      (path.length > 1 && pathname.startsWith(path) && path !== '/layout-1'),
    [pathname],
  );

  // Menu projet quand un projet est ouvert, menu plateforme sinon.
  // Les permissions restent celles de l'utilisateur : elles le suivent,
  // seul le perimetre des ecrans change.
  const isProjectMode = useProjectModeStore((s) => s.isProjectMode);
  const activeProjectId = meStore.getActiveProjectId();
  const { data: activeProject } = useProject(
    isProjectMode ? (activeProjectId ?? undefined) : undefined,
  );

  const menuConfig = useMemo(() => {
    if (!isProjectMode || !activeProjectId) return MENU_SIDEBAR;
    return buildProjectMenu(
      activeProjectId,
      activeProject?.name ?? '',
      meStore.getPermissionCodes(),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectMode, activeProjectId, activeProject?.name, meStore.me]);

  // Collect section values for localStorage persistence
  const sectionValues = useMemo(
    () =>
      menuConfig
        .filter((item) => item.heading && item.children && item.path)
        .map((item) => item.path!),
    [menuConfig],
  );

  const storageKey = 'sidebar-open-sections';

  // L'etat memorise vaut pour le menu qui l'a produit. En passant du menu
  // plateforme au menu projet, aucun de ses identifiants ne correspond : on
  // ouvre alors tous les groupes plutot que de les laisser tous fermes.
  const openSections = useMemo<string[]>(() => {
    let saved: string[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw) as string[];
    } catch {
      /* ignore */
    }
    const known = saved.filter((v) => sectionValues.includes(v));
    return known.length ? known : sectionValues;
  }, [sectionValues]);

  const handleSectionsChange = useCallback((values: string[]) => {
    localStorage.setItem(storageKey, JSON.stringify(values));
  }, []);

  if (!meStore.me) {
    return <SidebarMenuSkeleton />;
  }

  // L'apparence du rail (fond, item actif, intertitres) vit dans
  // `src/styles/theme.oui-crm.css`, section « Rail de navigation », et non
  // ici : le projet centralise le style de la sidebar dans la charte, via des
  // selecteurs `[data-slot=...]`. Ces classes ne portent donc que la
  // structure, pas les couleurs — sinon les deux se contrediraient.
  const classNames: AccordionMenuClassNames = {
    root: 'space-y-3',
    group: 'gap-px',
    label: 'pt-2.25 pb-px',
    separator: '',
    item: '',
    sub: '',
    subTrigger: 'h-auto pt-2.25 pb-px bg-transparent hover:bg-transparent',
    subContent: 'py-0',
    indicator: '',
  };

  const buildMenu = (items: MenuConfig): JSX.Element[] => {
    return items
      .filter((item: MenuItem) => !item.activeProject) // Exclude activeProject from scrollable menu
      .filter((item: MenuItem) => {
        if (!item.readPermission) return true;
        return meStore.hasPermission(item.readPermission);
      })
      // Un module desactive sur le projet actif masque l'entree, meme si la
      // permission est accordee : le droit ne sert a rien sans le module.
      .filter((item: MenuItem) => {
        if (!item.requiredModule) return true;
        return meStore.hasModule(item.requiredModule);
      })
      .map((item: MenuItem, index: number) => {
        if (item.heading && item.children) {
          return buildMenuSection(item, index);
        } else if (item.heading) {
          return buildMenuHeading(item, index);
        } else if (item.disabled) {
          return buildMenuItemRootDisabled(item, index);
        } else {
          return buildMenuItemRoot(item, index);
        }
      });
  };

  const buildMenuSection = (item: MenuItem, index: number): JSX.Element => {
    return (
      <AccordionMenuSub key={index} value={item.path || `section-${index}`}>
        <AccordionMenuSubTrigger className="h-auto pt-2.25 pb-px bg-transparent hover:bg-transparent">
          <span data-slot="accordion-menu-title">{item.heading}</span>
        </AccordionMenuSubTrigger>
        <AccordionMenuSubContent
          type="single"
          collapsible
          parentValue={item.path || `section-${index}`}
          className="ps-0"
        >
          <AccordionMenuGroup>
            {item.children!.map((child, childIndex) =>
              buildMenuItemRoot(child, childIndex),
            )}
          </AccordionMenuGroup>
        </AccordionMenuSubContent>
      </AccordionMenuSub>
    );
  };

  const buildMenuItemRoot = (item: MenuItem, index: number): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub key={index} value={item.path || `root-${index}`}>
          <AccordionMenuSubTrigger className="text-sm font-medium">
            {item.icon && <item.icon data-slot="accordion-menu-icon" />}
            <span data-slot="accordion-menu-title">{item.title}</span>
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `root-${index}`}
            className="ps-6"
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(item.children, 1)}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <Fragment key={index}>
          {item.separator && (
            <div className="my-3 h-px w-full bg-(--rail-line)" />
          )}
          <AccordionMenuItem
            value={item.path || ''}
            className="text-sm font-medium"
          >
            <Link
              to={item.path || '#'}
              className="flex items-center  grow gap-2"
            >
              {item.icon && <item.icon data-slot="accordion-menu-icon" />}
              <span data-slot="accordion-menu-title">{item.title}</span>
            </Link>
          </AccordionMenuItem>
        </Fragment>
      );
    }
  };

  const buildMenuItemRootDisabled = (
    item: MenuItem,
    index: number,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-${index}`}
        className="text-sm font-medium"
      >
        {item.icon && <item.icon data-slot="accordion-menu-icon" />}
        <span data-slot="accordion-menu-title">{item.title}</span>
      </AccordionMenuItem>
    );
  };

  const buildMenuItemChildren = (
    items: MenuConfig,
    level: number = 0,
  ): JSX.Element[] => {
    return items.map((item: MenuItem, index: number) => {
      if (item.disabled) {
        return buildMenuItemChildDisabled(item, index, level);
      } else {
        return buildMenuItemChild(item, index, level);
      }
    });
  };

  const buildMenuItemChild = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    if (item.children) {
      return (
        <AccordionMenuSub
          key={index}
          value={item.path || `child-${level}-${index}`}
        >
          <AccordionMenuSubTrigger className="text-[13px]">
            {item.collapse ? (
              <span className="text-muted-foreground">
                <span className="hidden [[data-state=open]>span>&]:inline">
                  {item.collapseTitle}
                </span>
                <span className="inline [[data-state=open]>span>&]:hidden">
                  {item.expandTitle}
                </span>
              </span>
            ) : (
              item.title
            )}
          </AccordionMenuSubTrigger>
          <AccordionMenuSubContent
            type="single"
            collapsible
            parentValue={item.path || `child-${level}-${index}`}
            className={cn(
              'ps-4',
              !item.collapse && 'relative',
              !item.collapse && (level > 0 ? '' : ''),
            )}
          >
            <AccordionMenuGroup>
              {buildMenuItemChildren(
                item.children,
                item.collapse ? level : level + 1,
              )}
            </AccordionMenuGroup>
          </AccordionMenuSubContent>
        </AccordionMenuSub>
      );
    } else {
      return (
        <AccordionMenuItem
          key={index}
          value={item.path || ''}
          className="text-[13px]"
        >
          <Link to={item.path || '#'}>{item.title}</Link>
        </AccordionMenuItem>
      );
    }
  };

  const buildMenuItemChildDisabled = (
    item: MenuItem,
    index: number,
    level: number = 0,
  ): JSX.Element => {
    return (
      <AccordionMenuItem
        key={index}
        value={`disabled-child-${level}-${index}`}
        className="text-[13px]"
      >
        <span data-slot="accordion-menu-title">{item.title}</span>
      </AccordionMenuItem>
    );
  };

  const buildMenuHeading = (item: MenuItem, index: number): JSX.Element => {
    return <AccordionMenuLabel key={index}>{item.heading}</AccordionMenuLabel>;
  };

  return (
    <div className="flex flex-col grow min-h-0">
      {/* Scrollable menu area */}
      <ScrollArea className="sidebar-menu-scroll flex grow min-h-0 px-4 pt-4">
        <AccordionMenu
          selectedValue={pathname}
          matchPath={matchPath}
          type="multiple"
          classNames={classNames}
          defaultRootValue={openSections}
          onRootValueChange={handleSectionsChange}
        >
          {buildMenu(menuConfig)}
        </AccordionMenu>
      </ScrollArea>
    </div>
  );
}
