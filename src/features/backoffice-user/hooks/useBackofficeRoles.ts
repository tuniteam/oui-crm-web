import { useQuery } from '@tanstack/react-query';
import { backofficeUserService } from '../services/backoffice-user.service';
import type { BackofficeRolesResponse } from '../types/backofficeUser';

/**
 * Roles back-office disponibles. Il n'y en a qu'un aujourd'hui (SUPER_ADMIN) :
 * ne rien coder en dur, le contrat prevoit que la liste evolue.
 */
export function useBackofficeRoles(enabled: boolean = true) {
  const query = useQuery<BackofficeRolesResponse>({
    queryKey: ['backoffice-roles'],
    queryFn: () => backofficeUserService.getRoles(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    roles: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.error,
  };
}
