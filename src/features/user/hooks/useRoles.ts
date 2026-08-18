import { useQuery } from '@tanstack/react-query';
import { rolesService } from '../services/rolesService';
import type { RoleListParams, RoleListResponse } from '../types/role';

type Options = {
  enabled?: boolean;
};

export function useRoles(params?: RoleListParams, options?: Options) {
  const query = useQuery<RoleListResponse, Error>({
    queryKey: ['roles', params?.isBackoffice ?? 'auto'],
    queryFn: () => rolesService.getAll(params),
    enabled: options?.enabled ?? true,
  });

  return {
    loading: query.isLoading,
    error: query.error,
    data: query.data?.data ?? [],
    refetch: query.refetch,
  };
}
