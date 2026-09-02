import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useMeStore } from '@/contexts/useMeStore';
import { getApiErrorCode, getApiErrorMessage } from '@/shared/utils/api-error';
import { ORGANIZATIONS_UI } from '../constants/organizationList.constants';
import { organizationService } from '../services/organization.service';
import type { OrganizationDetail } from '../types/organizationDetail';

/** `404` du contrat : fiche inconnue, supprimée, ou dont l'existence n'est pas
 *  révélée à un rôle sans lecture. */
const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';

export function useOrganization(id?: string, enabled = true) {
  const projectId = useMeStore((s) => s.activeProjectId);

  const query = useQuery<OrganizationDetail>({
    queryKey: ['organizations', 'detail', projectId, id],
    queryFn: () => organizationService.getOne(id as string),
    enabled: enabled && !!id,
  });

  useEffect(() => {
    if (!query.isError) return;
    toast.error(getApiErrorMessage(query.error) || ORGANIZATIONS_UI.ERRORS.FETCH);
  }, [query.isError, query.error]);

  return {
    organization: query.data ?? null,
    loading: query.isLoading,
    fetching: query.isFetching,
    /**
     * Fiche inexistante, supprimée, ou hors de portée d'un rôle sans lecture.
     *
     * A distinguer du chargement : les deux rendaient le même squelette, donc
     * un identifiant périmé laissait un panneau gris indéfiniment — et, tant
     * qu'une fiche restait en cache, un formulaire qu'aucun enregistrement ne
     * pouvait aboutir.
     */
    notFound: getApiErrorCode(query.error) === ORGANIZATION_NOT_FOUND,
    error: query.error,
  };
}
