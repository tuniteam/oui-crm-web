import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ERRORS } from '../constants/constants';
import { backofficeUserService } from '../services/backoffice-user.service';
import type {
  BackofficeUserListParams,
  BackofficeUserListResponse,
} from '../types/backofficeUser';

export const useBackofficeUsers = (params: BackofficeUserListParams) => {
  const query = useQuery<BackofficeUserListResponse>({
    queryKey: ['backoffice-users', 'list', params],
    queryFn: () => backofficeUserService.getAll(params),
  });

  // Effet et non corps de rendu : sinon une requete en echec reaffiche un
  // toast a chaque rendu, donc a chaque frappe dans la recherche.
  useEffect(() => {
    if (!query.isError) return;
    toast.error(
      query.error instanceof Error ? query.error.message : ERRORS.FETCH_USERS,
    );
  }, [query.isError, query.error]);

  return {
    response: query.data ?? null,
    users: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
};
