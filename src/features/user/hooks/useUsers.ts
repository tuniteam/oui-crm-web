import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
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

  if (query.isError) {
    /* Le service ne resout plus le message a notre place : on le demande a
       l'enveloppe, qui porte le code et sa traduction. */
    const msg = query.error ? getApiErrorMessage(query.error) : ERRORS.FETCH_USERS;
    console.error(msg);
    toast.error(msg);
  }

  return {
    response: query.data ?? null,
    users: query.data?.data ?? [],
    meta: query.data?.meta,
    loading: query.isLoading,
    fetching: query.isFetching,
    error: query.error,
  };
};
