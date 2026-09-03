import { PERMISSIONS } from '@/constants';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MENU_PROJECT } from '@/constants/menu';
import { ComingSoon } from '@/components/shared/ComingSoon';
import {
  SETTINGS_TABS,
  SETTINGS_UI,
} from '@/features/settings/constants/constants';
import { SettingsScreen } from '@/features/settings/components/SettingsScreen';
import AgendaScreen from '@/features/activity/components/AgendaScreen';
import CampaignsScreen from '@/features/campaign/components/CampaignsScreen';
import OrganizationsTable from '@/features/organization/components/OrganizationsTable';
import UsersTable from '@/features/user/components/UsersTable';
import { UserInformationsPage } from '@/pages/UserInformationsPage';
import { RequirePermission } from '@/guards/RequirePermission';

/**
 * Ecrans d'un projet ouvert. Structure et ordre repris de la maquette V8.
 *
 * Les fonctionnalites non encore livrees sont routees vers un ecran d'attente
 * plutot que masquees : l'utilisateur voit la cible et sait pourquoi elle est
 * vide. Chaque route reste protegee par sa permission.
 */
const SOON: { path: string; title: string; permission: string }[] = [
  { path: 'dashboard', title: MENU_PROJECT.DASHBOARD, permission: PERMISSIONS.DASHBOARD.READ },
  { path: 'stats', title: MENU_PROJECT.STATS, permission: PERMISSIONS.STATS.READ },
  { path: 'prospecting', title: MENU_PROJECT.PROSPECTING, permission: PERMISSIONS.ACTIVITIES.READ },
  { path: 'opportunities', title: MENU_PROJECT.OPPORTUNITIES, permission: PERMISSIONS.OPPORTUNITIES.READ },
  { path: 'quotes', title: MENU_PROJECT.QUOTES, permission: PERMISSIONS.QUOTES.READ },
  { path: 'contracts', title: MENU_PROJECT.CONTRACTS, permission: PERMISSIONS.CONTRACTS.READ },
  { path: 'invoices', title: MENU_PROJECT.INVOICES, permission: PERMISSIONS.INVOICES.READ },
  { path: 'portfolio', title: MENU_PROJECT.PORTFOLIO, permission: PERMISSIONS.ORGANIZATIONS.READ },
  { path: 'deployments', title: MENU_PROJECT.DEPLOYMENTS, permission: PERMISSIONS.DEPLOYMENTS.READ },
  { path: 'trainings', title: MENU_PROJECT.TRAININGS, permission: PERMISSIONS.TRAININGS.READ },
  { path: 'support', title: MENU_PROJECT.SUPPORT, permission: PERMISSIONS.TICKETS.READ },
  { path: 'renewals', title: MENU_PROJECT.RENEWALS, permission: PERMISSIONS.CONTRACTS.READ },
  { path: 'roles', title: MENU_PROJECT.ROLES, permission: PERMISSIONS.ROLES.READ },
];

export function ProjectWorkspaceRoutes() {
  return (
    <Routes>
      {/* Comme la V8, un projet s'ouvre sur son tableau de bord. */}
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route
        element={
          <RequirePermission permission={PERMISSIONS.ORGANIZATIONS.READ} />
        }
      >
        <Route path="organizations" element={<OrganizationsTable />} />
      </Route>

      <Route
        element={<RequirePermission permission={PERMISSIONS.CAMPAIGNS.READ} />}
      >
        <Route path="campaigns" element={<CampaignsScreen />} />
      </Route>

      <Route
        element={<RequirePermission permission={PERMISSIONS.ACTIVITIES.READ} />}
      >
        <Route path="agenda" element={<AgendaScreen />} />
      </Route>

      <Route element={<RequirePermission permission={PERMISSIONS.USERS.READ} />}>
        <Route path="users" element={<UsersTable />} />
        {/* Sans cette route, la fiche d'un utilisateur du projet etait
            inatteignable : ni modification, ni retrait, ni surcharges. */}
        <Route
          path="users/:userId/informations"
          element={<UserInformationsPage />}
        />
      </Route>

      <Route
        element={<RequirePermission permission={PERMISSIONS.SETTINGS.READ} />}
      >
        <Route path="settings" element={<SettingsScreen />} />
      </Route>

      {/* Les referentiels sont un panneau de Parametres, plus une entree de
          menu : on redirige sur le panneau, pas sur l'ecran par defaut. */}
      <Route
        element={<RequirePermission permission={PERMISSIONS.REFERENCES.READ} />}
      >
        <Route
          path="reference-items"
          element={
            <Navigate
              to={`../settings?${SETTINGS_UI.TAB_PARAM}=${SETTINGS_TABS.REFERENCES}`}
              replace
            />
          }
        />
      </Route>

      {SOON.map(({ path, title, permission }) => (
        <Route key={path} element={<RequirePermission permission={permission} />}>
          <Route path={path} element={<ComingSoon title={title} />} />
        </Route>
      ))}
    </Routes>
  );
}
