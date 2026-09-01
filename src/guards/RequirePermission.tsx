// src/routing/route-guards.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useMeStore } from '@/contexts/useMeStore';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';

type RequirePermissionProps = {
  permission: string;
  fallbackTo?: string;
};

export function RequirePermission({
  permission,
  fallbackTo,
}: RequirePermissionProps) {
  const meStore = useMeStore();

  // Check if the user has the required permission
  // (based on the active role relationship)
  const has = meStore.hasPermission(permission);

  // If permission is missing, redirect away
  if (!has) {
    return (
      <Navigate to={fallbackTo ?? getAfterLoginRedirect(meStore)} replace />
    );
  }

  // If everything is OK, render the protected route
  return <Outlet />;
}
