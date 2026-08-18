// src/routing/route-guards.tsx
import { useMeStore } from '@/contexts/useMeStore';
import { tokenService } from '@/features/auth/services/token.service';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

type RequireAuthProps = {
  redirectTo?: string;
};
// Guard component that protects if a user in not authenticated
// he can't access to routes that require auth
export function RequireAuth({ redirectTo = '/auth/login' }: RequireAuthProps) {
  const me = useMeStore((s) => s.me);
  const location = useLocation();
  const tokensService = tokenService;
  const tokenExists = tokensService.getAccessToken();

  if (!me && !tokenExists) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
