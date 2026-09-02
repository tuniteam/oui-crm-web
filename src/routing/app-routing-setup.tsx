import { PERMISSIONS } from '@/constants';
import { NoPermissions } from '@/features/errors/components/no-permissions';
import { WelcomePending } from '@/features/errors/components/welcome-pending';
import { ProjectInformationsPage } from '@/pages/ProjectInformationsPage';
import { BackofficeUserInformationsPage } from '@/pages/BackofficeUserInformationsPage';
import BackofficeUsersPage from '@/pages/BackofficeUsersPage';
import ProjectsListPage from '@/pages/ProjectsListPage';
import UsersTable from '@/features/user/components/UsersTable';
import { GuestOnly } from '@/guards/GuestOnly';
import { RequireAuth } from '@/guards/RequireAuth';
import { RequirePermission } from '@/guards/RequirePermission';
import { RequireValidPath } from '@/guards/RequireValidPath';
import { ProjectScopeBinder } from '@/tenant/ProjectScopeBinder';
import { ProjectWorkspaceRoutes } from '@/routing/project-workspace-routes';
import EmailChangeConfirmationPage from '@/pages/EmailChangeConfirmationPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import UserActivationPage from '@/pages/UserActivationPage';
import { BrandedLayout } from '@/features/auth/layouts/branded';
import ProfilePage from '@/pages/ProfilePage';
import { UserInformationsPage } from '@/pages/UserInformationsPage';
import { Route, Routes } from 'react-router-dom';
import { Layout1 } from '@/components/layouts/layout-1';
import { AuthRouting } from './auth-routing';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/*
       * Pages publiques du contrat d'API (SPEC-11 §US-00-02). L'API construit
       * ces liens en `FRONT_URL` + `/activate`, `/reset`, `/email-change` :
       * ces chemins-la font foi, pas une variante sous `/auth`.
       *
       * Hors de tout garde, `GuestOnly` compris : le lien est ouvert depuis la
       * boite mail, parfois sur un appareil ou une autre session est ouverte.
       * Un destinataire deja connecte doit quand meme pouvoir activer son
       * compte ou confirmer son adresse.
       */}
      <Route path="/activate" element={<UserActivationPage />} />
      <Route path="/email-change" element={<EmailChangeConfirmationPage />} />
      <Route element={<BrandedLayout />}>
        <Route path="/reset" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<GuestOnly />}>
        <Route path="/auth/*" element={<AuthRouting />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout1 />}>
          <Route path="/profile" element={<ProfilePage />} />

          {/* Client no-permissions page */}
          <Route path="/no-permissions" element={<NoPermissions />} />

          {/*
           * Accueil d'un compte dont les droits portent sur des ecrans encore
           * a construire. Sans garde de permission : c'est precisement la
           * destination de repli quand aucune permission ne trouve d'ecran,
           * une garde la ferait renvoyer sur elle-meme.
           */}
          <Route path="/bienvenue" element={<WelcomePending />} />

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

          {/* Mode projet : le projet est dans l'URL du front (nouvel onglet),
              jamais dans l'appel API — l'en-tete x-project-id le porte. */}
          <Route
            path="/:projectId/*"
            element={
              <ProjectScopeBinder enableProjectMode>
                <ProjectWorkspaceRoutes />
              </ProjectScopeBinder>
            }
          />

          {/* Default / unknown paths inside layout */}
          <Route path="*" element={<RequireValidPath />} />
        </Route>
      </Route>

      {/* Final fallback */}
      <Route path="*" element={<RequireValidPath />} />
    </Routes>
  );
}
