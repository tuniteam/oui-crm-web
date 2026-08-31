import { Navigate, Outlet } from 'react-router-dom';
import { useMeStore } from '@/contexts/useMeStore';
import { getAfterLoginRedirect } from '@/features/auth/utils/getAfterLoginRedirect';

type RequireModuleProps = {
  module: string;
  fallbackTo?: string;
};

/**
 * Protege une route derriere un module actif sur le projet courant.
 *
 * Complementaire de RequirePermission : la permission dit ce que l'utilisateur
 * a le droit de faire, le module dit si la fonctionnalite est activee sur le
 * projet. Les deux sont necessaires, aucun n'implique l'autre.
 *
 * Les modules sont lus dans le store, alimente par GET /me. Contrairement a
 * soft-m, il n'y a pas de seconde source pour le back-office : si le besoin
 * apparait, l'ajouter ici plutot que dans les composants.
 */
export function RequireModule({ module, fallbackTo }: RequireModuleProps) {
  const meStore = useMeStore();

  if (!meStore.hasModule(module)) {
    return (
      <Navigate to={fallbackTo ?? getAfterLoginRedirect(meStore)} replace />
    );
  }

  return <Outlet />;
}
