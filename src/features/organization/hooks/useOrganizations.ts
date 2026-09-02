import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { ORGANIZATIONS_UI } from '../constants/organizationList.constants';
import { organizationService } from '../services/organization.service';
import type {
  OrganizationListParams,
  OrganizationListResponse,
} from '../types/organizationList';

export function useOrganizations(params: OrganizationListParams) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<OrganizationListResponse>({
    // Le projet fait partie de la cle : sans lui, changer de projet servirait
    // la liste du precedent depuis le cache.
    queryKey: ['organizations', 'list', projectId, params],
    queryFn: () => organizationService.getAll(params),
  });

  // Dans un effet, et non pendant le rendu : un toast declenche au rendu part
  // deux fois en StrictMode et a chaque re-rendu tant que l'erreur dure.
  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : ORGANIZATIONS_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    organizations: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
}
