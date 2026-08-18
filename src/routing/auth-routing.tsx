import { Navigate, Route, Routes } from 'react-router-dom';
import { authRoutes } from './auth-routes';

/**
 * Auth routes*
 */
export function AuthRouting() {
  return (
    <Routes>
      {/* index => /auth/login */}
      <Route index element={<Navigate to="login" replace />} />

      {authRoutes.map((route, idx) => {
        const basePath = route.path ?? '';

        return (
          <Route key={idx} path={basePath} element={route.element}>
            {route.children?.map((childRoute) => (
              <Route
                key={childRoute.path}
                path={childRoute.path}
                element={childRoute.element}
              />
            ))}
          </Route>
        );
      })}
    </Routes>
  );
}
