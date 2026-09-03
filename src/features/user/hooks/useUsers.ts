import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

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
    const msg =
      query.error instanceof Error ? query.error.message : ERRORS.FETCH_USERS;
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
