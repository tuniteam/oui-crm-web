import { Navigate, Outlet } from 'react-router-dom';
import { useMeStore } from '@/contexts/useMeStore';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';
import { tokenService } from '@/features/auth/services/token.service';
import { useGetMe } from '@/features/user/hooks/useGetMe';

type GuestOnlyProps = {
  redirectTo?: string;
};
// Guard component that protects if a user is authenticated 
// he can't access to auth routes
export function GuestOnly({ redirectTo }: GuestOnlyProps) {
  const meStore = useMeStore();
  const tokenExists = !!tokenService.getAccessToken();

  const meQuery = useGetMe();

  if (tokenExists && meQuery.isLoading && !meStore.me) {
    return null;
  }

  if (tokenExists && meStore.me) {
    return <Navigate to={redirectTo ?? getAfterLoginRedirect(meStore)} replace />;
  }

  return <Outlet />;
}
