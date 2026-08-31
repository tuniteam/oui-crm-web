import { PERMISSIONS } from '@/constants';
import { NoPermissions } from '@/features/errors/components/no-permissions';
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
