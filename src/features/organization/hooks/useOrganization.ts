import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { ORGANIZATIONS_UI } from '../constants/organizationList.constants';
import { organizationService } from '../services/organization.service';
import type { OrganizationDetail } from '../types/organizationDetail';

export function useOrganization(id?: string, enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<OrganizationDetail>({
    queryKey: ['organizations', 'detail', projectId, id],
    queryFn: () => organizationService.getOne(id as string),
    enabled: enabled && !!id,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error
        ? query.error.message
        : ORGANIZATIONS_UI.ERRORS.FETCH,
    );
  }, [query.isError, query.error]);

  return {
    organization: query.data ?? null,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
}
