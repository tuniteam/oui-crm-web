import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EMPTY_ARRAY } from '@/shared/constants/empty';
import { getApiErrorMessage } from '@/shared/utils/api-error';

import type { UserListParams, UserListResponse } from '../types/userList';
import { userService } from '../services/user.service';
import { ERRORS } from '../constants/userList.constants';

export const useUsers = (params: UserListParams, enabled = true) => {
  const query = useQuery<UserListResponse>({
    queryKey: ['users', 'list', params],
    queryFn: () => userService.getAll(params),
    enabled,
  });

  /*
   * Dans un effet, et **jamais dans le corps du rendu**.
   *
   * Au rendu, le bandeau repartait a chaque re-rendu tant que l'erreur durait
   * — vingt-cinq fois de suite sur la liste des organismes, qui se re-rend a
   * chaque frappe de filtre. Meme regle que `useOrganizations` et `useRoles`.
   *
   * Le service ne resout plus le message a notre place : on le demande a
   * l'enveloppe, qui porte le code et sa traduction.
   */
  useEffect(() => {
    if (!query.isError) return;
    const msg = query.error ? getApiErrorMessage(query.error) : ERRORS.FETCH_USERS;
    console.error(msg);
    toast.error(msg);
  }, [query.isError, query.error]);

  return {
    response: query.data ?? null,
    users: query.data?.data ?? EMPTY_ARRAY,
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
};
