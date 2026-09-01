// src/config/menu-project.ts
import { PERMISSIONS } from '@/constants';
import {
  Boxes,
  Building2,
  CalendarClock,
  ClipboardList,
  Contact,
  FileSignature,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Receipt,
  RefreshCw,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import type { MenuConfig } from '@/config/types';
import { MENU_PROJECT } from '@/constants/menu';
import { PROJECT_ROUTES } from '@/features/project/constants/routes.constants';

/**
 * Menu affiche quand un projet est ouvert. Structure reprise de la maquette
 * V8 : cinq groupes, dans son ordre.
 *
 * Chaque groupe est un bloc repliable (`heading` + `children`), comme le menu
 * de gestion client de soft-m. Un groupe pousse a plat rendrait un simple
 * intertitre, non repliable.
 *
 * Toutes les entrees sont navigables. Celles dont l'ecran n'existe pas encore
 * menent a un ecran d'attente qui l'explique : desactiver l'entree laissait
 * l'utilisateur devant un element grise, sans savoir ni pourquoi ni quand.
 */
export const buildProjectMenu = (
  projectId: string,
  projectName: string,
  permissions: string[] = [],
): MenuConfig => {
  const can = (p?: string) => !p || permissions.includes(p);
  const at = (path: string) => `/${projectId}${path}`;

  // Entete : nom du projet et retour a la liste, rendu hors du menu defilant.
  const menu: MenuConfig = [
    { activeProject: projectName, path: PROJECT_ROUTES.PROJECTS },
  ];

  const P = PERMISSIONS;

  const groups: {
    key: string;
    heading: string;
    items: {
      title: string;
      icon: MenuConfig[number]['icon'];
      path: string;
      permission?: string;
    }[];
  }[] = [
    {
      key: 'steering',
      heading: MENU_PROJECT.GROUPS.STEERING,
      items: [
        { title: MENU_PROJECT.DASHBOARD, icon: LayoutDashboard, path: '/dashboard', permission: P.DASHBOARD.READ },
        { title: MENU_PROJECT.AGENDA, icon: CalendarClock, path: '/agenda', permission: P.ACTIVITIES.READ },
        { title: MENU_PROJECT.STATS, icon: TrendingUp, path: '/stats', permission: P.STATS.READ },
      ],
    },
    {
      key: 'prospecting',
      heading: MENU_PROJECT.GROUPS.PROSPECTING,
      items: [
        { title: MENU_PROJECT.ORGANIZATIONS, icon: Building2, path: '/organizations', permission: P.ORGANIZATIONS.READ },
        { title: MENU_PROJECT.CAMPAIGNS, icon: Megaphone, path: '/campaigns', permission: P.CAMPAIGNS.READ },
        { title: MENU_PROJECT.PROSPECTING, icon: ClipboardList, path: '/prospecting', permission: P.ACTIVITIES.READ },
      ],
    },
    {
      key: 'sales',
      heading: MENU_PROJECT.GROUPS.SALES,
      items: [
        { title: MENU_PROJECT.OPPORTUNITIES, icon: Target, path: '/opportunities', permission: P.OPPORTUNITIES.READ },
        { title: MENU_PROJECT.QUOTES, icon: FileText, path: '/quotes', permission: P.QUOTES.READ },
        { title: MENU_PROJECT.CONTRACTS, icon: FileSignature, path: '/contracts', permission: P.CONTRACTS.READ },
        { title: MENU_PROJECT.INVOICES, icon: Receipt, path: '/invoices', permission: P.INVOICES.READ },
      ],
    },
    {
      key: 'customers',
      heading: MENU_PROJECT.GROUPS.CUSTOMERS,
      items: [
        { title: MENU_PROJECT.PORTFOLIO, icon: Wallet, path: '/portfolio', permission: P.ORGANIZATIONS.READ },
        { title: MENU_PROJECT.DEPLOYMENTS, icon: Boxes, path: '/deployments', permission: P.DEPLOYMENTS.READ },
        { title: MENU_PROJECT.TRAININGS, icon: GraduationCap, path: '/trainings', permission: P.TRAININGS.READ },
        { title: MENU_PROJECT.SUPPORT, icon: LifeBuoy, path: '/support', permission: P.TICKETS.READ },
        { title: MENU_PROJECT.RENEWALS, icon: RefreshCw, path: '/renewals', permission: P.CONTRACTS.READ },
      ],
    },
    {
      key: 'administration',
      heading: MENU_PROJECT.GROUPS.ADMINISTRATION,
      items: [
        // Seul ecran de projet deja porte cote front.
        { title: MENU_PROJECT.USERS, icon: Users, path: '/users', permission: P.USERS.READ },
        { title: MENU_PROJECT.ROLES, icon: UserCog, path: '/roles', permission: P.ROLES.READ },
        { title: MENU_PROJECT.SCOPES, icon: ShieldCheck, path: '/scopes', permission: P.SCOPES.READ },
        { title: MENU_PROJECT.REFERENCES, icon: Contact, path: '/reference-items', permission: P.REFERENCES.READ },
        { title: MENU_PROJECT.SETTINGS, icon: Settings, path: '/settings', permission: P.SETTINGS.READ },
      ],
    },
  ];

  for (const group of groups) {
    const visible = group.items.filter((i) => can(i.permission));
    if (!visible.length) continue;

    menu.push({
      heading: group.heading,
      // Identifiant du bloc repliable, memorise en localStorage. Ce n'est pas
      // une route : les ecrans sont a plat sous /:projectId.
      path: `${at('')}#${group.key}`,
      children: visible.map((item) => ({
        title: item.title,
        icon: item.icon,
        path: at(item.path),
        readPermission: item.permission,
      })),
    });
  }

  return menu;
};
