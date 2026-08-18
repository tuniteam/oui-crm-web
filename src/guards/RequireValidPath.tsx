// src/routing/route-guards.tsx
import { useMeStore } from '@/contexts/useMeStore';
import { tokenService } from '@/features/auth/services/token.service';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';
import { Navigate, useLocation } from 'react-router-dom';

// Guard component that redirects an authenticated user to default route
// if he tries to acess an invalid route

export function RequireValidPath() {
  const meStore = useMeStore();
  const me = meStore.me
  const location = useLocation();
  const tokensService = tokenService;
  const tokenExists = tokensService.getAccessToken();
  const route = getAfterLoginRedirect(meStore);

  if (!me && !tokenExists) {
    return <Navigate to='/auth/login' replace state={{ from: location }} />;
  }
  return <Navigate to={route} />;
}
