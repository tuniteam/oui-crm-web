import { PERMISSIONS } from '@/constants';
import { NoPermissions } from '@/features/errors/components/no-permissions';
import { ProjectInformationsPage } from '@/pages/ProjectInformationsPage';
import { BackofficeUserInformationsPage } from '@/pages/BackofficeUserInformationsPage';
import BackofficeUsersPage from '@/pages/BackofficeUsersPage';
import ProjectsListPage from '@/pages/ProjectsListPage';
import UsersTable from '@/features/user/components/UsersTable';
import { GuestOnly } from '@/guards/GuestOnly';
import { RequireAuth } from '@/guards/RequireAuth';
import { RequirePermission } from '@/guards/RequirePermission';
import { RequireValidPath } from '@/guards/RequireValidPath';
import EmailChangeConfirmationPage from '@/pages/EmailChangeConfirmationPage';
import ProfilePage from '@/pages/ProfilePage';
import { UserInformationsPage } from '@/pages/UserInformationsPage';
import { Route, Routes } from 'react-router-dom';
import { Layout1 } from '@/components/layouts/layout-1';
import { AuthRouting } from './auth-routing';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* Public — accessible whatever the auth state (link clicked from any device). */}
      <Route
        path="/auth/email-change"
        element={<EmailChangeConfirmationPage />}
      />

      <Route element={<GuestOnly />}>
        <Route path="/auth/*" element={<AuthRouting />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout1 />}>
          <Route path="/profile" element={<ProfilePage />} />

          {/* Client no-permissions page */}
          <Route path="/no-permissions" element={<NoPermissions />} />

          <Route
            element={
              <RequirePermission permission={PERMISSIONS.PROJECTS.READ} />
            }
          >
            <Route path="/projects" element={<ProjectsListPage />} />
            <Route
              path="/projects/:projectId/informations"
              element={<ProjectInformationsPage />}
            />
          </Route>

          <Route
            element={
              <RequirePermission
                permission={PERMISSIONS.USER_BACKOFFICE.READ}
              />
            }
          >
            <Route
              path="/backoffice-users"
              element={<BackofficeUsersPage />}
            />
            <Route
              path="/backoffice-users/:userId/informations"
              element={<BackofficeUserInformationsPage />}
            />
          </Route>

          <Route element={<RequirePermission permission={PERMISSIONS.USERS.READ} />}>
            <Route path="/users" element={<UsersTable />} />
            <Route
              path="/users/:userId/informations"
              element={<UserInformationsPage />}
            />
          </Route>

          {/* Default / unknown paths inside layout */}
          <Route path="*" element={<RequireValidPath />} />
        </Route>
      </Route>

      {/* Final fallback */}
      <Route path="*" element={<RequireValidPath />} />
    </Routes>
  );
}
